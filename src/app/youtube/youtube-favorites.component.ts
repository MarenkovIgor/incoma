import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { YoutubeService } from '@app/youtube/youtube.service';
import { FavoritesService } from '@app/youtube/favorites.service';
import { concat, ConnectableObservable, Observable, of, ReplaySubject } from 'rxjs';
import { map, publishReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BaseVideoListComponent } from '@app/youtube/base-video-list.component';
import { arrayMap } from '@app/common/rxjs';
import { IVideoVM } from '@app/youtube/ivideo-vm';
import { Bind } from 'lodash-decorators';

@Component({
  selector: 'ints-youtube-favorites',
  templateUrl: './youtube-favorites.component.html',
  styleUrls: ['./youtube-favorites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeFavoritesComponent extends BaseVideoListComponent {
  constructor(
    private _youtube: YoutubeService,
    private _cdr: ChangeDetectorRef,
    favorites: FavoritesService
  ) {
    super(favorites);

    const favoritesChanges = this._favorites.changes.pipe(takeUntil(this.destroy), publishReplay());
    (favoritesChanges as ConnectableObservable<any>).connect();

    concat(
      this._youtube.getVideos(this._favorites.values).pipe(arrayMap(this._toVM)),
      favoritesChanges.pipe(switchMap(this._updateVideos))
    )
      .pipe(takeUntil(this.destroy))
      .subscribe(videos => {
        this.videos = videos;

        this._cdr.markForCheck();
      });
  }

  @Bind
  private _updateVideos(changes: {id: string, action: 'add'|'remove'}): Observable<IVideoVM[]> {
    const { id, action } = changes;

    return action === 'add'
      ? this._youtube.getVideos([id]).pipe(arrayMap(this._toVM), map(newItem => this.videos.concat(newItem)))
      : of(this.videos.filter(video => video.id !== id));
  }

  videos: IVideoVM[] = [];
}
