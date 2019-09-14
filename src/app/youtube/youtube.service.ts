import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, Subject, Subscription, using} from 'rxjs';
import { isEmpty } from 'lodash';
import {takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  constructor(private http: HttpClient) {
    const apiKey = 'AIzaSyDBql8ZDuHnlHFDZCtKms79XzF9EpPQrw0';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&order=viewCount&q=test&type=video&fields=nextPageToken%2Citems(snippet%2Ftitle)&key=${apiKey}`;

    this.http.get(url).subscribe(console.log);
  }

  initTopVideoSearch(subString?: string): {dataChunk: Observable<IVideo[]>; requestChunk(count?: number)} {
    const dataChunk = new Subject<IVideo[]>();
    // let nextPageToken: string;

    const requestChunk = (count?: number) => {

    };

    (async () => {
      const { nextPageToken, items } = await this.searchVideo(subString);

      if(!isEmpty(items))
        dataChunk.next(items);

      dataChunk.next(items);
    })();

    // return {};
  }

  private async searchVideo(count = 50, subString?: string, nextPageToken?: string): Observable<{nextPageToken?: string, items: IVideo[]}> {
    throw new Error('Not implemented');
  }

  private static VideoSearch = class {

    get result() { return using(() => this.dispose(), () => this._result); }

    private readonly _result = new Subject<IVideo[]>();

    // private readonly _dispose = new Subject();
    private _searchSubscription: Subscription;

    private _nextPageToken: string;

    constructor(private _searchString: string, private _youtube: YoutubeService) {}

    requestChunk(count?: number) {
      if(this._result.closed)
        throw new Error('Search result iteration finished!');

      if(this._searchSubscription != null)
        throw new Error('Search request in progress!');

      this._searchSubscription =
        this._youtube.searchVideo(count, this._searchString, this._nextPageToken)
          .subscribe({
            next: ({items, nextPageToken}) => {
              if (!isEmpty(items)) {
                this._result.next(items);
              }

              if (nextPageToken == null || isEmpty(items)) {
                this._result.complete();
              }

              this._nextPageToken = nextPageToken;
            },
            error: (ex) => this._result.error(ex)
          });

      this._searchSubscription.add(
        () => this._searchSubscription = null
      );

      // (async () => {
      //   if(this._result.closed)
      //     throw new Error('Search result iteration finished!');
      //
      //   let nextPageToken: string;
      //   let items: IVideo[];
      //
      //   try {
      //     const result = await this._youtube.searchVideo(count, this._searchString, this._nextPageToken);
      //
      //     nextPageToken = result.nextPageToken;
      //     items = result.items;
      //   } catch (ex) {
      //     // if
      //   }
      //
      //   if(!isEmpty(items))
      //     this._result.next(items);
      //
      //   if(nextPageToken == null || isEmpty(items))
      //     this._result.complete();
      //
      //   this._nextPageToken = nextPageToken;
      // })();
    }

    dispose() {
      if(this._searchSubscription != null)
        this._searchSubscription.unsubscribe();
    }
  }
}



export interface IVideo {

}
