
```js
// serviceworker.js
import { swserve } from 'sw-server';
import { match, handle } from 'sw-server/lib/webtorrent/sw.js'

swserve({ match, handle });
```

```js
// client.js with a webtorrent instance in scope as `client`
import { clientserve } from 'sw-server';
import { match, makeHandle } from 'sw-server/lib/webtorrent/client.js'

clientserve({ match, handle: makeHandle(client) });
```
