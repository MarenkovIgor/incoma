import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, from, merge, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { isEmpty } from 'lodash';
import { LoggingService } from '@app/services/logging.service';
import { catchError, pluck, reduce, takeUntil, tap } from 'rxjs/operators';
import { YOUTUBE_API_URL } from './api-url.token';
import { Dictionary } from 'lodash';
import { read } from 'fs';

//TODO правильно ли это в данном случае?
@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  readonly maxItemsInResponse = 50;

  constructor(
    private _http: HttpClient,
    private _logging: LoggingService,
    @Inject(YOUTUBE_API_URL)
    private _apiUrl: string
  ) {
    // const apiKey = 'AIzaSyDBql8ZDuHnlHFDZCtKms79XzF9EpPQrw0';
    // const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&order=viewCount&q=test&type=video&fields=nextPageToken%2Citems(snippet%2Ftitle)&key=${apiKey}`;
    //
    // this.http.get(url).subscribe(console.log);
  }

  getVideos(ids: string[], cancel: Observable<any>): Promise<IVideo[]> {
    const self = this;

    return merge(
      ...Array.from(toChunks(ids)).map(getVideoChunk)
    )
      .pipe(
        reduce((acc, cur) => acc.concat(cur)),
        takeUntil(cancel)
      )
      .toPromise();

    function getVideoChunk(idsChunk: string[]): Observable<IVideo[]> {
      throw 'Not implemented!';
    }

    //
    // async function* g2() {
    //   yield 1;
    //   yield* [2, 3];
    // }
    //
    // const x: AsyncIterableIterator
    //
    // return from((function* () {
    //   let currentChunkSubscription: Subscription;
    //
    //   for (let sliceStart = 0; sliceStart < ids.length;) {
    //     const chunk = ids.slice(sliceStart, sliceStart += self.maxItemsInResponse);
    //
    //     const url =
    //
    //     // currentChunkSubscription =
    //   }
    // })());

    // const self = this;
    //
    // //TODO Observable from generator?
    // return new Observable(subscriber => {
    //   const onUnsubscribe = new ReplaySubject(1);
    //
    //   (async () => {
    //     try {
    //       await downloadVideos(ids, onUnsubscribe);
    //     }
    //
    //     // for (const idChunk of toChunks(ids))
    //   })();
    //
    //   return () => onUnsubscribe.next();
    // });
    //
    function *toChunks(videoIds: string[]) {
       for (let sliceStart = 0; sliceStart < videoIds.length;)
         yield videoIds.slice(sliceStart, sliceStart += self.maxItemsInResponse);
    }
  }

  private* _getVideos(ids: string[]) {
    const dispose = new

    for (let sliceStart = 0; sliceStart < ids.length;) {
      const chunk = ids.slice(sliceStart, sliceStart += this.maxItemsInResponse);
      const url = this._buildUrl(
        'https://www.googleapis.com/youtube/v3/videos',
        [
          ['part', 'snippet'],
          ['id', ids.join()],
          ['fields', 'items(id,snippet/title)']
        ]
      );

      const currentSubscription = this._http.get<{items}>()
    }
  }

  initVideoSearch2(subString?: string|null): AsyncIterableIterator<IVideo[]> {
    throw 'not implemented';
  }

  initTopVideoSearch(subString?: string|null): IVideoSearch {
    if (subString == null)
      subString = '';

    return new YoutubeService.VideoSearch(subString, this);
  }

  private _searchVideo(
    count = this.maxItemsInResponse,
    subString?: string,
    nextPageToken?: string
  ): Observable<{nextPageToken?: string, items: IVideo[]}> {
    //TODO count param assertion?
    // if (count < 1 || count > this.maxRequestLength)
    //   throw new Error('Count out of range!');

    const url = this._buildUrl(
      'https://www.googleapis.com/youtube/v3/search',
      [
        ['q', subString],
        ['maxResults', count.toString()],
        ['nextPageToken', nextPageToken],
        ['part', 'snippet'],
        ['order', 'viewCount'],
        ['type', 'video'],
        ['fields', 'nextPageToken,(snippet/title)'],
        ['key', this._apiUrl],
      ]
    );

    return this._http.get<{nextPageToken?: string, items: IVideo[]}>(url, { observe: 'body' });
  }

  private _buildUrl(baseUrl: string, params: ReadonlyArray<readonly [string, string | undefined]> = []) {
    return `${baseUrl}?${toQueryString(params)}`;

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

  private static VideoSearch = class implements IVideoSearch {
    constructor(private _searchString: string, private _youtube: YoutubeService) {}

    getNextChunk(count?: number): Observable<IVideo[]> {
      return this._youtube._searchVideo(count, this._searchString, this._nextPageToken)
        .pipe(
          catchError(ex => {
            this._youtube._logging.error(ex);

            return EMPTY;
          }),
          tap(({ nextPageToken, items }) => {
            this._nextPageToken = nextPageToken;

            this.finished = nextPageToken == null || isEmpty(items);
          }),
          pluck('items')
        );
    }

    private _nextPageToken: string | undefined;

    finished = false;
  };
}

export interface IVideoSearch {
  getNextChunk(count?: number): Observable<IVideo[]>;
  finished: boolean;

  // result: Observable<IVideo[]>;
  // requestChunk(count?: number);
}

export interface IVideo {
  id: string;
  title: string;
}
