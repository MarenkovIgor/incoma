import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscription, using } from 'rxjs';
import { isEmpty } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  public readonly maxRequestLength = 50;

  constructor(private http: HttpClient) {
    const apiKey = 'AIzaSyDBql8ZDuHnlHFDZCtKms79XzF9EpPQrw0';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&order=viewCount&q=test&type=video&fields=nextPageToken%2Citems(snippet%2Ftitle)&key=${apiKey}`;

    this.http.get(url).subscribe(console.log);
  }

  getVideos(ids: string[]): Observable<IVideo[]> {
    throw new Error('not implemented');
  }

  initTopVideoSearch(subString?: string|null): IVideoSearch {
    return new YoutubeService.VideoSearch(subString, this);
  }

  private searchVideo(count = this.maxRequestLength, subString?: string, nextPageToken?: string): Observable<{nextPageToken?: string, items: IVideo[]}> {
    if(count < 1 || count > this.maxRequestLength)
      throw new Error('Count out of range!');

    throw new Error('Not implemented');
  }

  private static VideoSearch = class implements IVideoSearch {

    private readonly _result = new Subject<IVideo[]>();

    readonly result = using(() => this.dispose(), () => this._result);

    private _searchSubscription: Subscription | null;

    private _nextPageToken: string | undefined;

    constructor(private _searchString: string, private _youtube: YoutubeService) {}

    getChunk(count?: number) {
      if(this._result.closed)
        throw new Error('Video search finished!');

      if(this._searchSubscription != null)
        throw new Error('Search request in progress!');

      this._searchSubscription =
        this._youtube.searchVideo(count, this._searchString, this._nextPageToken)
          .subscribe({
            next: ({items, nextPageToken}) => {
              if (!isEmpty(items))
                this._result.next(items);

              if (nextPageToken == null || isEmpty(items))
                this._result.complete();

              this._nextPageToken = nextPageToken;
            },
            error: (ex) => this._result.error(ex)
          });

      this._searchSubscription.add(
        () => this._searchSubscription = null
      );
    }

    dispose() {
      if(this._searchSubscription != null)
        this._searchSubscription.unsubscribe();
    }
  }
}

export interface IVideoSearch {
  getChunk(count?: number): Observable<IVideo[]>;
  // result: Observable<IVideo[]>;
  // requestChunk(count?: number);
}

export interface IVideo {
  id: string;
  title: string;
}
