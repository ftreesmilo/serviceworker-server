# ServiceWorker Server

This project makes it easier to serve files from within the page as a regular
url request.

Let's say you have a website with a service worker.
In your site you've made a file that exists in

* memory
* [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
* [FilesystemAccess](https://web.dev/file-system-access/)
* etc...

that you would like the user to download.

You can stream the file contents through your serviceworker, giving the resource
a friendly URL to your site. There is a library already that handles serving
files out of a downloaded torrent through a webtorrent client on the page.

```js
// serviceworker.js
import { swserve } from 'serviceworker-server/lib/worker.js';
import { match } from 'serviceworker-server/lib/impl/webtorrent/wt-worker.js'

swserve({ match });
```

```js
// client.js with a webtorrent instance in scope as `client`
import { clientserve } from 'serviceworker-server/lib/client.js';
import { match, makeHandle } from 'serviceworker-server/lib/impl/webtorrent/wt-client.js'

clientserve({ match, handle: makeHandle(client) });
```

## Implementing your own library
