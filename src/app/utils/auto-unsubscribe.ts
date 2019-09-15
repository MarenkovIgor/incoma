import { OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

export abstract class AutoUnsubscribe implements OnDestroy {

  public ngOnDestroy(): void {
    this.destroy.next();
    this.subscriptions.unsubscribe();
  }

  protected readonly subscriptions = new Subscription();
  protected readonly destroy = new Subject();
}
