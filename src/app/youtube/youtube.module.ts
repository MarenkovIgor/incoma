import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YoutubeListComponent } from './youtube-list.component';
import { YoutubeService } from './youtube.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [YoutubeListComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [YoutubeListComponent],
  providers: [YoutubeService]
})
export class YoutubeModule { }
