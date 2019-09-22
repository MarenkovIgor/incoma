import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild
} from '@angular/core';
import { IVideo, YoutubeService } from './youtube.service';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Bind, Throttle } from 'lodash-decorators';
import { BaseVideoListComponent } from '@app/youtube/base-video-list.component';
import { FavoritesService } from '@app/youtube/favorites.service';
import { IVideoVM } from '@app/youtube/ivideo-vm';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'ints-youtube-top',
  templateUrl: './youtube-top.component.html',
  styleUrls: ['./youtube-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeTopComponent extends BaseVideoListComponent implements AfterContentInit {

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
  }

  readonly searchInput = new FormControl();

  @Bind
  private setQuery(value: string) {
    if (this._query === value)
      return;

    this._query = value;

    this._searchVideo(this._query);
  }

  private _query: string | undefined;

  ngAfterContentInit(): void {
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

  private readonly _items = new BehaviorSubject<IVideoVM[]>([]);

  readonly items = this._items.pipe(map(e => this._currentVideoSearch === null ? e : [...e, 'loading']));

  private _currentVideoSearch: AsyncIterableIterator<IVideo[]> | null = null;

  @ViewChild(CdkVirtualScrollViewport, { static: true })
  set scrollViewport(value: CdkVirtualScrollViewport) {
    (this._scrollViewport = value)
      .elementScrolled()
      .pipe(takeUntil(this.destroy))
      .subscribe(this.checkNextRequest);
  }

  private _scrollViewport: CdkVirtualScrollViewport | undefined;

  @Throttle(300)
  @Bind
  checkNextRequest() {
    const itemsLeft = this._items.value.length - this._scrollViewport!.getRenderedRange().end + 1;

    if (itemsLeft < this._youtube.maxChunkSize / 5)
      this._requestNextChunk();
  }

  private async _requestNextChunk() {
    console.log('_requestNextChunk');

    if (this._currentVideoSearch === null || this._nextChunkRequest !== null)
      return;

    try {
      const { value: chunk, done } = await (this._nextChunkRequest = this._currentVideoSearch.next());

      if (done)
        this._currentVideoSearch = null;

      this._items.next(this._items.value.concat(chunk.map(this._toVM)));
    } finally {
      this._nextChunkRequest = null;
    }

    this.checkNextRequest();
  }

  private _nextChunkRequest: ReturnType<AsyncIterableIterator<IVideo[]>['next']> | null = null;

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

