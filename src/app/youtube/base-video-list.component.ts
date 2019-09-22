import { IVideo } from './youtube.service';
import { FormControl } from '@angular/forms';
import { Bind } from 'lodash-decorators';
import { FavoritesService } from './favorites.service';
import { AutoUnsubscribe } from '@app/utils/auto-unsubscribe';
import { takeUntil } from 'rxjs/operators';
import { IVideoVM } from '@app/youtube/ivideo-vm';

export abstract class BaseVideoListComponent extends AutoUnsubscribe {
  protected constructor(protected _favorites: FavoritesService) {
    super();
  }

  @Bind
  protected _toVM(item: IVideo): IVideoVM {
    return {
      ...item,
      isFavorite: this._createFavoriteControl(item.id)
    };
  }

  protected _createFavoriteControl(videoId: string) {
    const control = new FormControl(this._favorites.exists(videoId));

    control.valueChanges
      .pipe(takeUntil(this.destroy))
      .subscribe(
        change =>
          change
            ? this._favorites.add(videoId)
            : this._favorites.remove(videoId)
      );
    return control;
  }
}

