# VM `docker-compose.yml` changes for the frontend SSR runtime

`docker-compose.yml` and the VM `.env` are **not in this repo** — they live only on the
production VM (`/var/www/zbc-news/`). This file is the exact, hand-applied change set for the
`frontend` service after the Dockerfile was switched from static nginx to the Node
`react-router-serve` runtime. Apply it by SSH on the VM.

## 1. Port mapping — **no change needed**

The runtime container listens on **port 80** (`ENV PORT=80` in the frontend Dockerfile; the
Node process binds it directly, replacing the old internal nginx that also listened on 80).
So the existing mapping stays valid as-is:

```yaml
    ports:
      - "3000:80"          # unchanged
```

Do **not** change this line. The public edge (system nginx → Cloudflare) keeps reaching the
frontend on host port 3000 exactly as before.

## 2. New runtime env var — `INTERNAL_API_BASE_URL`

SSR loaders run **inside** the frontend container and fetch the backend on every request.
Without this, they use the build-time `VITE_API_BASE_URL` (`https://api.zbc.news/api/v1`),
so each SSR request leaves the host and round-trips out through Cloudflare + the system nginx
just to reach a container sitting next to it. This var points those **server-side** calls at
the backend over the internal Docker network instead. It has **no effect on the browser**
(client requests still use `VITE_API_BASE_URL`) and is inert if unset.

Add to the `frontend` service's `environment:` block (this is a **runtime** env var, not a
build `arg`):

```yaml
    environment:
      - INTERNAL_API_BASE_URL=http://backend/api/v1
```

…and, if the VM `.env` is the source for compose interpolation, add the same line there:

```dotenv
INTERNAL_API_BASE_URL=http://backend/api/v1
```

Notes:
- `backend` is the **docker-compose service name** of the Laravel API container. Confirm it
  matches the actual service name in `docker-compose.yml`; if the backend service is named
  differently, use that name. The backend container's internal nginx listens on port **80**,
  so no port is needed in the URL.
- **`Host: backend` is safe** (verified in the backend code): there is no `trustHosts()` /
  trusted-hosts middleware, and the SSR-consumed endpoints derive no output from the request
  Host — canonical/OG/JSON-LD URLs come from `config('app.frontend_url')`, media from
  `asset()` (`APP_URL`). So an internal request with `Host: backend` returns the same bytes as
  a public one with `Host: api.zbc.news`.
- Plain **HTTP** on purpose: internal Docker-network traffic doesn't use TLS, and the app
  uses `INTERNAL_API_BASE_URL` verbatim (no `http→https` upgrade), unlike the public
  `VITE_API_BASE_URL`.

## 3. Nothing else changes

No other `docker-compose.yml` edits are required for this task. The frontend `build:` args
(all `VITE_*`) stay exactly as they are — they remain correct for the client bundle. If
discovery on the VM suggests a larger compose change is needed, stop and report rather than
expanding scope here.
