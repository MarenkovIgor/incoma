import { Component, Input } from '@angular/core';
import { IVideoVM } from '@app/youtube/ivideo-vm';

@Component({
  selector: 'ints-youtube-video',
  templateUrl: './youtube-video.component.html',
  styleUrls: ['./youtube-video.component.scss']
})
export class YoutubeVideoComponent {
  @Input()
  data: IVideoVM | null = null;
}

