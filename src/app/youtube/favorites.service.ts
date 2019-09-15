import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  list: Observable<string[]>;

  exists(id: string): boolean {
    throw new Error('not implemented');
  }

  add(id: string) {
    throw new Error('not implemented');
  }

  remove(id: string) {
    throw new Error('not implemented');
  }
}
