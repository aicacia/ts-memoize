import tape from "tape";
import { memoize } from "./memoize";

tape(
	"memoize: should return the same name as the passed in function",
	(assert) => {
		function identity<T>(x: T) {
			return x;
		}
		const memoized = memoize(identity);
		assert.equal(memoized.name, identity.name);
		assert.end();
	},
);

tape("memoize: should return cached value for same args", (assert) => {
	let callCount = 0;
	const fn = (x: number) => {
		callCount++;
		return x * 2;
	};
	const memoized = memoize(fn);

	const result1 = memoized(2);
	const result2 = memoized(2);

	assert.equal(result1, 4, "first call returns correct result");
	assert.equal(result2, 4, "second call returns same result");
	assert.equal(callCount, 1, "function called only once");

	assert.end();
});

tape("memoize: invalidate removes cached value", (assert) => {
	let callCount = 0;
	const fn = (x: number) => {
		callCount++;
		return x * 3;
	};
	const memoized = memoize(fn);

	const result1 = memoized(3);
	memoized.invalidate(3);
	const result2 = memoized(3);

	assert.equal(result1, 9, "first call result correct");
	assert.equal(result2, 9, "second call result correct after invalidation");
	assert.equal(callCount, 2, "function called again after invalidation");

	assert.end();
});

tape("memoize: clear removes all cached values", (assert) => {
	let callCount = 0;
	const fn = (x: number) => {
		callCount++;
		return x + 1;
	};
	const memoized = memoize(fn);

	memoized(1);
	memoized(2);
	memoized.clear();
	memoized(1);
	memoized(2);

	assert.equal(callCount, 4, "function called again for both after clear");

	assert.end();
});

tape("memoize: supports custom keyResolver", (assert) => {
	let callCount = 0;
	const fn = (a: { id: number }) => {
		callCount++;
		return a.id * 10;
	};
	const keyResolver = (a: { id: number }) => a.id;

	const memoized = memoize(fn, { keyResolver });

	const result1 = memoized({ id: 1 });
	const result2 = memoized({ id: 1 });

	assert.equal(result1, 10, "first call correct");
	assert.equal(result2, 10, "second call uses cache");
	assert.equal(callCount, 1, "called only once");

	assert.end();
});

tape("memoize: rejects promise and removes cache entry", async (assert) => {
	let callCount = 0;
	const fn = (x: number) => {
		callCount++;
		if (x === 1) {
			return Promise.reject(new Error("fail"));
		}
		return Promise.resolve(x * 2);
	};

	const memoized = memoize(fn);

	try {
		await memoized(1);
		assert.fail("should throw");
	} catch {
		assert.pass("first call rejects");
	}

	try {
		await memoized(1);
		assert.pass("second call attempts again after rejection");
	} catch {
		assert.pass("second call rejects again");
	}

	assert.equal(callCount, 2, "called twice due to rejection");

	assert.end();
});

tape("memoize: supports ExpiringMap expiration", (t) => {
	let callCount = 0;
	let expiredKey: string | number | symbol | undefined;

	const fn = (x: number) => {
		callCount++;
		return x * 100;
	};

	const memoized = memoize(fn, {
		expiringMap: {
			defaultTtlMs: 100,
			onExpire: (key) => {
				expiredKey = key;
			},
		},
	});

	const result1 = memoized(5);
	t.equal(result1, 500, "first call returns value");

	setTimeout(() => {
		const result2 = memoized(5);
		t.equal(result2, 500, "second call re-computes after expiration");
		t.equal(callCount, 2, "function called twice due to expiration");
		t.ok(expiredKey !== undefined, "onExpire was called");
		t.end();
	}, 150);
});
