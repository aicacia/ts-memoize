import tape = require("tape");
import { memoize } from "../lib";

const fac = memoize((x: number): number => (x === 0 ? 1 : x * fac(x - 1)));

tape("memoize", (assert: tape.Test) => {
  assert.equal(fac(5), 120);
  assert.equal(fac(5), 120);
  assert.equal(fac.clearCache(5), 120);

  assert.equal(fac(6), 720);
  assert.equal(fac(6), 720);
  assert.deepEqual(fac.clearCache(), {
    0: 1,
    1: 1,
    2: 2,
    3: 6,
    4: 24,
    5: 120,
    6: 720
  });

  assert.equal(fac(10), 3628800);

  assert.end();
});
