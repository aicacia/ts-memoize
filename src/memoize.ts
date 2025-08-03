import { hashOf } from "@aicacia/hash";
import { ExpiringMap, type ExpiringMapOptions } from "@aicacia/expiring-map";

// biome-ignore lint/suspicious/noExplicitAny: allow it
type Func = (...args: any[]) => any;
type Key = string | number | symbol;

export type MemorizedFunction<F extends Func, K extends Key = Key> = F & {
	cache: Map<K, ReturnType<F>>;
	invalidate(...args: Parameters<F>): void;
	clear(): void;
};

export interface MemorizeOptions<F extends Func, K extends Key = Key> {
	expiringMap?: ExpiringMapOptions<K, ReturnType<F>>;
	keyResolver?: (...args: Parameters<F>) => K;
}

export function memoize<F extends Func, K extends Key = Key>(
	fn: F,
	options: MemorizeOptions<F, K> = {},
): MemorizedFunction<F, K> {
	const cache =
		options.expiringMap != null
			? new ExpiringMap<K, ReturnType<F>>(options.expiringMap)
			: new Map<K, ReturnType<F>>();
	const keyResolver = (options?.keyResolver ?? hashOf) as (
		args: Parameters<F>,
	) => K;

	function memorizedFunction(this: unknown, ...args: Parameters<F>) {
		const key = keyResolver(args);
		let result: ReturnType<F>;
		if (cache.has(key)) {
			result = cache.get(key) as ReturnType<F>;
		} else {
			result = fn.apply(this, args);
			// @ts-expect-error
			if (result instanceof Promise) {
				result.catch(() => {
					cache.delete(key);
				});
			}
			cache.set(key, result);
		}
		return result;
	}

	memorizedFunction.cache = cache;
	memorizedFunction.invalidate = (...args: Parameters<F>) => {
		cache.delete(keyResolver(args));
	};
	memorizedFunction.clear = () => {
		cache.clear();
	};

	return memorizedFunction as MemorizedFunction<F, K>;
}
