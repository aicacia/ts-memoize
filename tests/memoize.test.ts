import tape = require("tape");
import { memoize } from "../lib";

const fac = memoize((x: number): number => (x === 0 ? 1 : x * fac(x - 1)));

tape("memoize", (assert: tape.Test) => {
  assert.equal(fac(5), 120);
  assert.equal(fac(5), 120);
  fac.clearCache(5);

  assert.equal(fac(10), 3628800);
  assert.equal(fac(10), 3628800);
  fac.clearCache();

  assert.equal(fac(10), 3628800);

  assert.end();
});
