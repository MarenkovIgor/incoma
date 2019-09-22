import { pickBy } from 'lodash';

export class Exception extends Error {
  public readonly innerException: any;

  constructor(arg?: string | { message?: string, innerException?: any }) {
    let message: string | undefined;
    let innerException;

    if (typeof arg === 'string') {
      message = arg;
    } else if (arg != null) {
      message = arg.message;
      innerException = arg.innerException;
    }

    super(message);

    this.innerException = innerException;
  }

  public get name() {
    return this.constructor.name;
  }

  public toString() {
    return JSON.stringify(this);
  }

  public toJSON() {
    const rv = {
      name: this.name,
      innerException: this.innerException,
      message: this.message
    };

    return pickBy(rv, v => v != null);
  }
}
