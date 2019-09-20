import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { IVideo, IVideoSearch, YoutubeService } from './youtube.service';
import { takeUntil } from 'rxjs/operators';
import { arrayMap } from '@app/utils/rxjs';
import { Subscription } from 'rxjs';
import { Throttle } from 'lodash-decorators';
import { BaseVideoListComponent } from '@app/youtube/base-video-list.component';
import { FavoritesService } from '@app/youtube/favorites.service';
import { IVideoVM } from '@app/youtube/ivideo-vm';

@Component({
  selector: 'ints-youtube-top',
  templateUrl: './youtube-top.component.html',
  styleUrls: ['./youtube-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeTopComponent extends BaseVideoListComponent {

  get topVideos(): Iterable<IVideoVM | 'loading'> {
    return this._topVideos();
  }

  @Input()
  set query(value: string | null) {
    if (this._query === value)
      return;

    this._query = value;

    this._searchVideo(this._query);
  }

  private _query: string | null = null;

  private _currentVideoSearch: AsyncIterableIterator<IVideo[]> | null = null;
  // @ts-ignore
  // private _currentVideoSearch: IVideoSearch;

  private _items: IVideoVM[] = [];
  private _nextChunkSubscription: Subscription | null = null;
  private readonly _requestLength = this._youtube.maxItemsInResponse;

  constructor(
    private _youtube: YoutubeService,
    private _cdr: ChangeDetectorRef,
    favoritesStorage: FavoritesService
  ) {
    super(favoritesStorage);

    this._searchVideo();
  }

  private _searchVideo(query?: string | null) {
    if (this._currentVideoSearch !== null && this._currentVideoSearch.return)
      this._currentVideoSearch.return();

    this._currentVideoSearch = this._youtube.initVideoSearch2(query);

    this._requestNextChunk();
  }

  private _requestNextChunk() {
    if (this._currentVideoSearch === null)
      return;
  }

  // private _searchVideo(query?: string | null) {
  //   if (this._nextChunkSubscription != null)
  //     this._nextChunkSubscription.unsubscribe();
  //
  //   this._currentVideoSearch = this._youtube.initTopVideoSearch(query);
  //
  //   this._requestNextChunk();
  // }

  // private _requestNextChunk() {
  //   if (this._nextChunkSubscription === null || this._currentVideoSearch.finished)
  //     return;
  //
  //   this._nextChunkSubscription =
  //     this._currentVideoSearch
  //       .getNextChunk(this._requestLength)
  //       .pipe(
  //         takeUntil(this.destroy),
  //         arrayMap(this._toVM)
  //       )
  //       .subscribe(
  //         dataChunk => this._items.push(...dataChunk)
  //       );
  //
  //   this._nextChunkSubscription
  //     .add(() => {
  //       this._nextChunkSubscription = null;
  //       this._cdr.markForCheck();
  //     });
  // }

  private* _topVideos() {
    yield* this._items;

    if (this._nextChunkSubscription !== null)
      yield 'loading';
  }

  //TODO как тут будет работать change detection
  @Throttle(300)
  onItemScrolled(scrolledItems: number) {
    const itemsLeft = this._items.length - scrolledItems;

    if (itemsLeft <= this._requestLength)
      this._requestNextChunk();
  }
}

