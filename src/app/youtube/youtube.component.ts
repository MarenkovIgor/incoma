import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'ints-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeComponent {
  listMode: 'top' | 'favorites' = 'top';

  readonly searchInput = new FormControl();

  readonly searchQuery = this.searchInput.valueChanges.pipe(debounceTime(300));
}

