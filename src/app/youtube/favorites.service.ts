import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { LoggerService } from '@app/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  get changes(): Observable<{id: string, action: 'add'|'remove'}> {
    return this._changes;
  }
  private readonly _changes = new Subject<{id: string, action: 'add'|'remove'}>();

  get values(): string[] {
    return Array.from(this._favorites.values());
  }
  private readonly _storageKey = 'FavoritesService|73c5e37cbc0a01a319e74e994ca54926';

  private readonly _favorites: Set<string> = this._loadFavorites();

  constructor(private _logger: LoggerService) {}

  exists(id: string): boolean {
    return this._favorites.has(id);
  }

  add(id: string) {
    if (this.exists(id))
      return;

    this._favorites.add(id);
    this._saveFavorites();

    this._changes.next({id, action: 'add'});
  }

  remove(id: string) {
    if (!this.exists(id))
      return;

    this._favorites.delete(id);
    this._saveFavorites();

    this._changes.next({id, action: 'remove'});
  }

  private _saveFavorites() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this.values));
    }
    catch(ex) {
      this._logger.error(ex);
    }
  }

  private _loadFavorites() {
    const emptySet = new Set<string>();
    const serializedList = localStorage.getItem(this._storageKey);

    if (serializedList === null)
      return emptySet;

    try {
      const valuesArray: string[] = JSON.parse(serializedList);
      if(!Array.isArray(valuesArray))
        throw 'bad value in storage';

      return new Set(valuesArray);
    }
    catch(ex) {
      this._logger.error(ex);

      return emptySet;
    }
  }
}
