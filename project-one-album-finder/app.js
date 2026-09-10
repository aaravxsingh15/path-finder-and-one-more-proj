/*
 * Album Finder — finds every album by an artist using the Spotify Web API.
 *
 * Auth: client-credentials flow. The browser exchanges a Client ID + Client
 * Secret for a short-lived access token, then calls the public catalog
 * endpoints. Credentials live in localStorage only (see the "API keys" dialog).
 *
 * Note: the client-credentials flow exposes your Client Secret to anyone using
 * this page. That is fine for a local learning project; for anything public,
 * move the token request to a small backend.
 */

const TOKEN_KEY = "spotify_token";
const CREDS_KEY = "spotify_creds";

const els = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("searchInput"),
  status: document.getElementById("status"),
  artistCard: document.getElementById("artistCard"),
  artistImg: document.getElementById("artistImg"),
  artistName: document.getElementById("artistName"),
  artistFollowers: document.getElementById("artistFollowers"),
  artistGenres: document.getElementById("artistGenres"),
  controls: document.getElementById("controls"),
  albumCount: document.getElementById("albumCount"),
  grid: document.getElementById("grid"),
  sortBy: document.getElementById("sortBy"),
  fAlbum: document.getElementById("fAlbum"),
  fSingle: document.getElementById("fSingle"),
  fCompilation: document.getElementById("fCompilation"),
  fAppears: document.getElementById("fAppears"),
  settingsBtn: document.getElementById("settingsBtn"),
  dialog: document.getElementById("settingsDialog"),
  settingsForm: document.getElementById("settingsForm"),
  clientId: document.getElementById("clientId"),
  clientSecret: document.getElementById("clientSecret"),
};

let allAlbums = []; // last fetched, unfiltered

/* ------------------------- credentials + token ------------------------- */

function getCreds() {
  try {
    return JSON.parse(localStorage.getItem(CREDS_KEY)) || null;
  } catch {
    return null;
  }
}

function saveCreds(id, secret) {
  localStorage.setItem(CREDS_KEY, JSON.stringify({ id, secret }));
  localStorage.removeItem(TOKEN_KEY); // force a fresh token
}

async function getToken() {
  const cached = JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
  if (cached && cached.expires_at > Date.now() + 5000) return cached.access_token;

  const creds = getCreds();
  if (!creds) throw new Error("Add your Spotify Client ID and Secret first (top-right “API keys”).");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: creds.id,
      client_secret: creds.secret,
    }),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error_description || "Could not get a token — check your credentials.");
  }

  const data = await res.json();
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000,
    })
  );
  return data.access_token;
}

async function api(path) {
  const token = await getToken();
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    return api(path); // one retry with a fresh token
  }
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error?.message || `Spotify API error (${res.status}).`);
  }
  return res.json();
}

/* ----------------------------- data fetch ----------------------------- */

async function findArtist(name) {
  const q = encodeURIComponent(name);
  const data = await api(`/search?q=${q}&type=artist&limit=1`);
  return data.artists.items[0] || null;
}

async function fetchAllAlbums(artistId) {
  const groups = "album,single,compilation,appears_on";
  let url = `/artists/${artistId}/albums?include_groups=${groups}&limit=50&market=US`;
  const out = [];

  while (url) {
    const page = await api(url);
    out.push(...page.items);
    url = page.next ? page.next.replace("https://api.spotify.com/v1", "") : null;
  }

  // Spotify returns the same album once per market/variant — dedupe by name+date.
  const seen = new Set();
  return out.filter((a) => {
    const key = `${a.name.toLowerCase()}::${a.release_date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ------------------------------ rendering ----------------------------- */

function renderArtist(artist) {
  els.artistImg.src = artist.images?.[0]?.url || "";
  els.artistName.textContent = artist.name;
  els.artistFollowers.textContent = `${artist.followers.total.toLocaleString()} followers`;
  els.artistGenres.innerHTML = "";
  (artist.genres || []).slice(0, 5).forEach((g) => {
    const span = document.createElement("span");
    span.textContent = g;
    els.artistGenres.appendChild(span);
  });
  els.artistCard.hidden = false;
}

function activeFilters() {
  const set = new Set();
  if (els.fAlbum.checked) set.add("album");
  if (els.fSingle.checked) set.add("single");
  if (els.fCompilation.checked) set.add("compilation");
  if (els.fAppears.checked) set.add("appears_on");
  return set;
}

function renderGrid() {
  const filters = activeFilters();
  let list = allAlbums.filter((a) => filters.has(a.album_group || a.album_type));

  const sort = els.sortBy.value;
  list.sort((a, b) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    const cmp = (a.release_date || "").localeCompare(b.release_date || "");
    return sort === "date-asc" ? cmp : -cmp;
  });

  els.albumCount.textContent =
    `${list.length} release${list.length === 1 ? "" : "s"} shown ` +
    `(${allAlbums.length} total found)`;

  els.grid.innerHTML = "";
  if (!list.length) {
    els.grid.innerHTML = `<p class="empty">No releases match these filters.</p>`;
    return;
  }

  const frag = document.createDocumentFragment();
  for (const a of list) {
    const card = document.createElement("a");
    card.className = "album";
    card.href = a.external_urls.spotify;
    card.target = "_blank";
    card.rel = "noopener";
    const year = (a.release_date || "").slice(0, 4);
    const group = (a.album_group || a.album_type || "").replace("_", " ");
    card.innerHTML = `
      <img loading="lazy" alt="${escapeHtml(a.name)} cover" src="${a.images?.[1]?.url || a.images?.[0]?.url || ""}" />
      <div class="info">
        <p class="title">${escapeHtml(a.name)}</p>
        <p class="sub">${year}${year && group ? " · " : ""}${group} · ${a.total_tracks} tracks</p>
      </div>`;
    frag.appendChild(card);
  }
  els.grid.appendChild(frag);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function setStatus(msg, isError = false) {
  els.status.textContent = msg;
  els.status.classList.toggle("error", isError);
}

/* ------------------------------- events ------------------------------- */

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = els.input.value.trim();
  if (!name) return;

  setStatus("Searching…");
  els.controls.hidden = true;
  els.grid.innerHTML = "";

  try {
    const artist = await findArtist(name);
    if (!artist) {
      els.artistCard.hidden = true;
      setStatus(`No artist found for “${name}”.`, true);
      return;
    }
    renderArtist(artist);
    setStatus("Loading albums…");

    allAlbums = await fetchAllAlbums(artist.id);
    els.controls.hidden = false;
    renderGrid();
    setStatus("");
  } catch (err) {
    setStatus(err.message, true);
    if (/credential|token/i.test(err.message)) openSettings();
  }
});

[els.sortBy, els.fAlbum, els.fSingle, els.fCompilation, els.fAppears].forEach((el) =>
  el.addEventListener("change", () => {
    if (allAlbums.length) renderGrid();
  })
);

/* --------------------------- settings dialog -------------------------- */

function openSettings() {
  const creds = getCreds();
  if (creds) {
    els.clientId.value = creds.id;
    els.clientSecret.value = creds.secret;
  }
  els.dialog.showModal();
}

els.settingsBtn.addEventListener("click", openSettings);

els.settingsForm.addEventListener("submit", (e) => {
  if (e.submitter && e.submitter.value === "save") {
    const id = els.clientId.value.trim();
    const secret = els.clientSecret.value.trim();
    if (id && secret) {
      saveCreds(id, secret);
      setStatus("Credentials saved. Try your search again.");
    }
  }
});

// Prompt for keys on first visit.
if (!getCreds()) {
  setStatus("Add your Spotify API keys (top-right) to get started.");
}
