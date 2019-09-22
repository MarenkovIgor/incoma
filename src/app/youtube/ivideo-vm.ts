import { IVideo } from '@app/youtube/youtube.service';
import { FormControl } from '@angular/forms';

export interface IVideoVM extends IVideo {
  isFavorite: FormControl;
}
