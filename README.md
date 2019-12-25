# ts-memoize

memoize

```ts
import { memoize } from "@aicacia/memoize";

const fac = memoize((x: number): number => (x === 0 ? 1 : x * fac(x - 1)));

fac(5); // 120
// this call will just return the previous result since the arguments are the same
fac(5); // 120
```
