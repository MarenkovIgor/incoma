import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoggerService } from '@app/services/logger.service';
import { scan } from 'rxjs/operators';

@Component({
  selector: 'ints-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YoutubeComponent {
  constructor(private _logger: LoggerService) {}

  readonly logs = this._logger.logs
    .pipe(
      scan((acc: string[], cur: string) => acc.concat(cur), new Array<string>())
    );

  listMode: 'top' | 'favorites' = 'top';
}

