
```js
// serviceworker.js
import { swserve } from 'serviceworker-server';
import { match, handle } from 'serviceworker-server/lib/impl/webtorrent/sw.js'

swserve({ match, handle });
```

```js
// client.js with a webtorrent instance in scope as `client`
import { clientserve } from 'serviceworker-server';
import { match, makeHandle } from 'serviceworker-server/lib/impl/webtorrent/client.js'

clientserve({ match, handle: makeHandle(client) });
```
