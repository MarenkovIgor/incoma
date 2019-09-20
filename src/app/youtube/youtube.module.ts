import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YoutubeComponent } from './youtube.component';
import { YoutubeService } from './youtube.service';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {ReactiveFormsModule} from '@angular/forms';
import {YoutubeTopComponent} from './youtube-top.component';
import { YoutubeFavoritesComponent } from './youtube-favorites.component';
import { YoutubeVideoComponent } from './youtube-video.component';

@NgModule({
  declarations: [YoutubeComponent, YoutubeTopComponent, YoutubeFavoritesComponent, YoutubeVideoComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    ScrollingModule,
    ReactiveFormsModule
  ],
  exports: [YoutubeComponent],
  // providers: [YoutubeService]
})
export class YoutubeModule { }
