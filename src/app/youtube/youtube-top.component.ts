import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, TrackByFunction, ViewChild } from '@angular/core';
import { IVideo, YoutubeService } from './youtube.service';
import { debounceTime, map, takeUntil, throttleTime } from 'rxjs/operators';
import { bind, Throttle } from 'lodash-decorators';
import { BaseVideoListComponent } from '@app/youtube/base-video-list.component';
import { FavoritesService } from '@app/youtube/favorites.service';
import { IVideoVM } from '@app/youtube/ivideo-vm';
import { FormControl } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs';
import { findNode } from '@angular/compiler';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'ints-youtube-top',
  templateUrl: './youtube-top.component.html',
  styleUrls: ['./youtube-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeTopComponent extends BaseVideoListComponent {

  readonly searchInput = new FormControl();

  @ViewChild(CdkVirtualScrollViewport, {static: true})
  scrollViewport: CdkVirtualScrollViewport | undefined;
  // set scrollViewport(value: CdkVirtualScrollViewport) {
  //   value.re
  //
  //   value.renderedRangeStream
  //     .pipe(
  //       takeUntil(this.destroy),
  //       throttleTime(300)
  //     )
  //     .subscribe(range => {
  //       const itemsLeft = this._items.value.length - range.end + 1;
  //
  //       if (itemsLeft < this._youtube.maxChunkSize / 2)
  //         this._requestNextChunk();
  //     });
  // }

  // videoTracker: TrackByFunction<IVideoVM | 'loading'> = (_, video) => video === 'loading' ? video : video.id;

  // get topVideos(): Iterable<IVideoVM | 'loading'> {
  //   // console.log('get topVideos');
  //   //
  //   // return this._items;
  //
  //   // console.log(Array.from(this._topVideos()));
  //
  //   return this._topVideos();
  // }

  // readonly items = new Beh

  @bind
  private setQuery(value: string) {
    if (this._query === value)
      return;

    this._query = value;

    this._searchVideo(this._query);
  }

  private _query: string | undefined;

  private _currentVideoSearch: AsyncIterableIterator<IVideo[]> | null = null;

  private readonly _items = new BehaviorSubject<IVideoVM[]>([]);

  readonly items = this._items.pipe(map(e => this._currentVideoSearch === null ? e : [...e, 'loading']));

  constructor(
    private _youtube: YoutubeService,
    favoritesStorage: FavoritesService
  ) {
    super(favoritesStorage);

    this.searchInput
      .valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy),
      )
      .subscribe(this.setQuery);

    this.destroy
      .subscribe(() => this._cancelCurrentSearch());

    this._searchVideo();
  }

  private _searchVideo(query?: string) {
    this._cancelCurrentSearch();

    this._items.next([]);

    this._currentVideoSearch = this._youtube.searchVideo(query);

    this._requestNextChunk();
  }

  private _cancelCurrentSearch() {
    if (this._currentVideoSearch !== null && this._currentVideoSearch.return)
      this._currentVideoSearch.return();

    this._currentVideoSearch = null;

    this._items.next([]);
  }

  private async _requestNextChunk() {
    if (this._currentVideoSearch === null || this._nextChunkRequest !== null)
      return;

    try {
      const { value: chunk, done } = await (this._nextChunkRequest = this._currentVideoSearch.next());

      if (done)
        this._currentVideoSearch = null;

      this._items.next(this._items.value.concat(chunk.map(this._toVM)));
    }
    finally {
      this._nextChunkRequest = null;
    }
  }

  private _nextChunkRequest: ReturnType<AsyncIterableIterator<IVideo[]>['next']>|null = null;

  @Throttle(300)
  onItemScrolled() {
    const itemsLeft = this._items.value.length - this.scrollViewport!.getRenderedRange().end + 1;

    if (itemsLeft < this._youtube.maxChunkSize / 5)
      this._requestNextChunk();
  }

  protected _createFavoriteControl(videoId: string): FormControl {
    const control = super._createFavoriteControl(videoId);

    this._favorites
      .changes
      .pipe(takeUntil(this.destroy))
      .subscribe(({ id, action }) => {
        if (id === videoId)
          control.setValue(action === 'add');
      });

    return control;
  }
}

