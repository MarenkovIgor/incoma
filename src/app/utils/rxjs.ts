import { map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

export function arrayMap<T,R>(mapper:(item:T)=>R): OperatorFunction<T[],R[]> {
  return map(e => e.map(mapper));
}
