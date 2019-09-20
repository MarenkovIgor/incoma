import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  constructor() { }

  error(ex: any) {
    throw new Error('Not implemented!');
  }
}
