# Cairn

A Vue 3 log of U.S. national parks you’ve visited. Search uses the [National Park Service API](https://www.nps.gov/subjects/developer/get-started.htm).

## Setup

```bash
npm install
```

Park search needs an NPS API key. The key is **not** in this repo.

1. Request a free key: [Get Started with the NPS API](https://www.nps.gov/subjects/developer/get-started.htm)
2. Copy `.env.example` to `.env` in the project root
3. Set the key (no `VITE_` prefix — that would bake it into the browser bundle):

```
NPS_API_KEY=your_key_here
```

4. Start the app. Restart `npm run dev` if you change `.env` after the server is already running.

```bash
npm run dev
```

Local requests go to `/nps`. Vite’s proxy forwards them to `developer.nps.gov` and attaches `X-Api-Key`. `.env` is gitignored; never commit the real key.
