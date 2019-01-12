import { hash } from "@stembord/hash";

const hashArgs = (args: any[]): number => {
  let hashed = 0;

  for (let i = 0, il = args.length; i < il; i++) {
    hashed = (31 * hashed + hash(args[i])) | 0;
  }

  return hashed;
};

export type Procedure = (...args: any[]) => any;

type Memoized<F> = F & { clearCache(...args: any[]): void };

export const memoize = <F extends Procedure>(func: F): Memoized<F> => {
  let cache: { [key: string]: any } = {};

  const memoized: Memoized<F> = function memoized<T>(
    this: T,
    ...args: any[]
  ): any {
    const key = hashArgs(args);

    if (cache.hasOwnProperty(key)) {
      return cache[key];
    } else {
      const result = func.apply(this, args);
      cache[key] = result;
      return result;
    }
  } as any;

  memoized.clearCache = (...args: any[]) => {
    if (args.length === 0) {
      cache = {};
    } else {
      delete cache[hashArgs(args)];
    }
  };

  return memoized;
};
