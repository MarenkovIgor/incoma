import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  constructor(private http: HttpClient) {
    const apiKey = 'AIzaSyDBql8ZDuHnlHFDZCtKms79XzF9EpPQrw0';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&order=viewCount&q=test&type=video&fields=nextPageToken%2Citems(snippet%2Ftitle)&key=${apiKey}`;

    this.http.get(url).subscribe(console.log);
  }
}
