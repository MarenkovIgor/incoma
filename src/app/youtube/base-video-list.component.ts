import { IVideo } from './youtube.service';
import { FormControl } from '@angular/forms';
import { Bind } from 'lodash-decorators';
import { FavoritesService } from './favorites.service';
import { AutoUnsubscribe } from '@app/utils/auto-unsubscribe';

export abstract class BaseVideoListComponent extends AutoUnsubscribe {
  protected constructor(protected _favorites: FavoritesService) {
    super();
  }

  @Bind
  protected _toVM(video: IVideo) {
    return {
      ...video,
      isFavorite: this._createFavoriteControl(video.id)
    };
  }

  protected _createFavoriteControl(videoId) {
    const control = new FormControl(this._favorites.exists(videoId));
    control.valueChanges
      .subscribe(
        change =>
          change
            ? this._favorites.add(videoId)
            : this._favorites.remove(videoId)
      );

    return control;
  }
}

