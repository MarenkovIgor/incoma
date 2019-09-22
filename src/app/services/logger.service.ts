import { Injectable } from '@angular/core';
// @ts-ignore
import * as jc from 'json-cycle';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { scan } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  // private readonly _logs: string[] = [];
  // readonly logs: ReadonlyArray<string> = this._logs;

  get logs(): Observable<string> {
    return this._logs;
  }

  private readonly _logs = new Subject<string>();

  log(msg: string) {
    this._logs.next(`Log: ${msg}`);

    console.log(msg);
  }

  error(ex: any) {
    let errorMsg =
      ex instanceof Error
        ? ex.toString()
        : typeof ex === 'string'
        ? ex
        : jc.stringify(ex);

    this._logs.next(`Error: ${errorMsg}`);

    console.error(ex);
  }
}
