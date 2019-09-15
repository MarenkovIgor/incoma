import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import {IVideoSearch, YoutubeService} from './youtube.service';
import {takeUntil} from 'rxjs/operators';
import {arrayMap} from '@app/utils/rxjs';
import {Subscription} from 'rxjs';
import {Throttle} from 'lodash-decorators';
import {BaseVideoListComponent, IVideoVM} from '@app/youtube/base-video-list.component';
import {FavoritesService} from '@app/youtube/favorites.service';

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
  set query(value: string|null) {
    if (this._query === value)
      return;

    this._query = value;

    this._searchVideo(this._query);
  }

  private _query: string|null = null;

  private _currentVideoSearch: IVideoSearch;
  private _items: IVideoVM[] = [];
  private _chunkResultSubscription: Subscription | null;
  private readonly _requestLength: number;

  constructor(
    private _youtube: YoutubeService,
    private _cdr: ChangeDetectorRef,
    favoritesStorage: FavoritesService
  ) {
    super(favoritesStorage);

    this._requestLength = _youtube.maxRequestLength;

    this._searchVideo();
  }

  private _searchVideo(query?: string|null) {
    if(this._chunkResultSubscription != null)
      this._chunkResultSubscription.unsubscribe();

    this._currentVideoSearch = this._youtube.initTopVideoSearch(query);

    this._requestNextChunk();
  }

  private _requestNextChunk() {
    const self = this;

    this._chunkResultSubscription =
      this._currentVideoSearch
        .getChunk(this._requestLength)
        .pipe(
          takeUntil(this.destroy),
          arrayMap(this._toVM)
        )
        .subscribe(dataChunk => {
          this._items.push(...dataChunk);

          this._cdr.markForCheck();
        });

    this._chunkResultSubscription
      .add(() => this._chunkResultSubscription = null);
  }

  private *_topVideos() {
    for (let item of this._items)
      yield item;

    if(this._dataLoading)
      yield 'loading';
  }

  @Throttle(300)
  onItemScrolled(scrolledItems: number) {
    if (this._dataLoading)
      return;

    const itemsLeft = this._items.length - scrolledItems;

    if(itemsLeft <= this._requestLength)
      this._requestNextChunk();
  }

  private get _dataLoading(): boolean {
    return this._chunkResultSubscription != null;
  }
}

