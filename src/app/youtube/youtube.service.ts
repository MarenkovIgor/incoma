import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concat, EMPTY, from, merge, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { isEmpty } from 'lodash';
import { LoggerService } from '@app/services/logger.service';
import { catchError, map, pluck, reduce, takeUntil, tap } from 'rxjs/operators';
import { YOUTUBE_API_KEY } from './api-key.token';
import { chunk } from 'lodash';
import { bind } from 'lodash-decorators';
import { arrayMap } from '@app/utils/rxjs';

//TODO правильно ли это в данном случае?
@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  readonly maxChunkSize = 50;

  constructor(
    @Inject(YOUTUBE_API_KEY
    )
    private _apiKey: string,

    private _http: HttpClient,
    private _logger: LoggerService
  ) {
  }

  getVideos(ids: string[]): Observable<IVideo[]> {
    return concat(
      ...chunk(ids, this.maxChunkSize).map(this._getVideos)
    )
      .pipe(
        reduce((acc, cur) => acc.concat(cur)),
        catchError(ex => {
          this._logger.error(ex);

          return EMPTY;
        })
      );
  }

  @bind
  private _getVideos(ids: string[]) {
    const url = this._buildUrl(
      'videos',
      [
        ['part', 'snippet'],
        ['id', ids.join()],
        ['fields', 'items(id,snippet/title)']
      ]
    );

    return this._http.get<Res>(url, { observe: 'body' })
      .pipe(
        pluck('items'),
        arrayMap(({ id, snippet: { title } }) => ({ id, title }))
      );

    interface Res {
      items: Array<{id: string, snippet: {title: string}}>;
    }
  }

  async* searchVideo(subString?: string) {
    const finish = new Subject();
    let nextPageToken: string | undefined;

    while(true)
      try {
        const result = await this._searchVideo(subString, nextPageToken).pipe(takeUntil(finish)).toPromise();

        nextPageToken = result.nextPageToken;

        if(result.nextPageToken !== undefined && !isEmpty(result.items))
          yield result.items;
        else
          return result.items;
      }
      catch (ex) {
        this._logger.error(ex);

        yield [];
      }
      finally {
        finish.next();
      }
  }

  private _searchVideo(
    subString?: string,
    nextPageToken?: string
  ): Observable<{nextPageToken?: string, items: IVideo[]}> {
    const url = this._buildUrl(
      'search',
      [
        ['q', subString],
        ['maxResults', this.maxChunkSize.toString()],
        ['pageToken', nextPageToken],
        ['part', 'snippet'],
        ['order', 'viewCount'],
        ['type', 'video'],
        ['fields', 'nextPageToken,items(id/videoId,snippet/title)']
      ]
    );

    return this._http.get<Res>(url, { observe: 'body' })
      .pipe(
        map(
          res => ({
            nextPageToken: res.nextPageToken,
            items: res.items.map(
              ({ id: { videoId: id }, snippet: { title } }) => ({ id, title })
            )
          })
        )
      );

    interface Res {
      nextPageToken?: string;
      items: Array<{
        id: { videoId: string },
        snippet: { title: string }
      }>;
    }
  }

  private _buildUrl(endpoint: string, params: ReadonlyArray<readonly [string, string | undefined]> = []) {

    params = [...params, ['key', this._apiKey]];

    return `https://www.googleapis.com/youtube/v3/${endpoint}?${toQueryString(params)}`;

    function toQueryString(prms: typeof params) {
      return prms
        .map(([param, value]) => {
          if (value === undefined)
            return undefined;

          return `${encodeURIComponent(param)}=${encodeURIComponent(value)}`;
        })
        .filter(part => part !== undefined)
        .join('&');
    }
  }
}


export interface IVideo {
  id: string;
  title: string;
}
