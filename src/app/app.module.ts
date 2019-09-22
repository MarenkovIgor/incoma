import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { YoutubeModule } from './youtube/youtube.module';
import { YOUTUBE_API_KEY } from '@app/youtube/api-key.token';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    YoutubeModule
  ],
  providers: [{ provide: YOUTUBE_API_KEY, useValue: 'AIzaSyATXbRFZUYXGY-guuXMoOhe73xt5lriDOA' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
