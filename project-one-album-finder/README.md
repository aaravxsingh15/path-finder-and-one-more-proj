# Project 1 — Album Finder with the Spotify API

A single-page web app that takes an artist name and lists **every album, single,
EP, compilation, and "appears on"** release they have on Spotify — with cover art,
year, track count, and a link straight to Spotify.

Plain HTML / CSS / JavaScript. No build step, no framework, no npm.

![stack](https://img.shields.io/badge/JavaScript-vanilla-f7df1e) ![api](https://img.shields.io/badge/Spotify-Web%20API-1db954)

## How it works

1. **Auth** — the page uses Spotify's [client-credentials flow](https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow):
   it POSTs your Client ID + Secret to `accounts.spotify.com/api/token` and gets a
   1-hour access token (cached in `localStorage`).
2. **Search** — `GET /v1/search?type=artist` resolves the name to an artist ID.
3. **Albums** — `GET /v1/artists/{id}/albums` with `include_groups=album,single,compilation,appears_on`,
   following the `next` cursor until every page is fetched.
4. **Dedupe** — Spotify returns the same album once per market/variant, so results
   are collapsed by `name + release_date`.
5. **Render** — client-side filtering (by release type) and sorting (date / title).

## Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   and log in with any Spotify account.
2. **Create app** → give it any name/description → for *Redirect URI* enter
   `http://localhost:5173` (not used by this flow, but the form requires one) →
   check **Web API** → save.
3. Open the app's **Settings** and copy the **Client ID** and **Client Secret**.

## Run

No server is strictly required — but browsers block `fetch` from `file://` on some
setups, so serve the folder:

```bash
# any one of these, from inside project-one-album-finder/
python -m http.server 5173
# or
npx serve -l 5173
```

Then open <http://localhost:5173>, click **API keys** (top-right), paste your
Client ID and Secret, and search.

## Files

| File         | Purpose                                        |
|--------------|-----------------------------------------------|
| `index.html` | markup + the credentials `<dialog>`           |
| `style.css`  | dark Spotify-ish theme, responsive grid       |
| `app.js`     | token handling, API calls, filtering, render  |

## Security note

The client-credentials flow puts your Client Secret in front-end code. That's
acceptable for a local learning project. For anything you deploy publicly, move
the `/api/token` request to a tiny backend and keep the secret there.
