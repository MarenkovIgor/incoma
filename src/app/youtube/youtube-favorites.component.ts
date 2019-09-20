import { ChangeDetectionStrategy, Component } from '@angular/core';
import { YoutubeService } from '@app/youtube/youtube.service';
import { FavoritesService } from '@app/youtube/favorites.service';
import { map, switchMap } from 'rxjs/operators';
import { BaseVideoListComponent } from '@app/youtube/base-video-list.component';
import { arrayMap } from '@app/utils/rxjs';

@Component({
  selector: 'ints-youtube-favorites',
  templateUrl: './youtube-favorites.component.html',
  styleUrls: ['./youtube-favorites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeFavoritesComponent extends BaseVideoListComponent {
  readonly videos = this._initItems();

  constructor(
    private _youtube: YoutubeService,
    favorites: FavoritesService
  ) {
    super(favorites);
  }

  private _initItems() {
    return this._favorites
      .list
      .pipe(
        switchMap(ids => this._youtube.getVideos(ids)),
        arrayMap(this._toVM)
      );
  }
}
