import { hash } from "@aicacia/hash";

export const hashArgs = (args: any[]): number => {
  let hashed = 0;

  for (let i = 0, il = args.length; i < il; i++) {
    hashed = (31 * hashed + hash(args[i])) | 0;
  }

  return hashed;
};

export type Procedure = (...args: any[]) => any;

export type Memoized<F extends Procedure> = F & {
  clearCache(...args: any[]): ReturnType<F> | { [key: string]: ReturnType<F> };
};

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
      const oldCache = cache;
      cache = {};
      return oldCache;
    } else {
      const hashed = hashArgs(args),
        value = cache[hashed];

      delete cache[hashed];
      return value;
    }
  };

  return memoized;
};
