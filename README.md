# Freshy's · freshysfoods.com

Svježa hrana i recepti za pse u gramima, Osijek. Statična stranica (React), objavljuje se na Vercelu.

## Što je gdje

- `site/` je gotova stranica koju Vercel objavljuje (`vercel.json`: `outputDirectory: "site"`, bez gradnje na Vercelu).
  - `index.html`: naslov, opis i slika za dijeljenje poveznice.
  - `assets/app.<hash>.js`: cijela stranica u jednoj datoteci.
  - `fu/`: slike recepata (256, 512 i 1024 px), fontovi i podaci (katalog recepata, pasmine, ambulante). Ništa se ne učitava s drugih poslužitelja.
- `src/FreshysSite.tsx`: izvorni kod stranice (ista komponenta kao Freshy's u portfoliju, ovdje u načinu `site: "live"`: bez trake „Koncept · prototip”, bez Freshy's Plusa).
- `data/catalog.json`: katalog recepata s gramima, iz kojeg je složena stranica.
- `build/`: gradnja stranice iz `src/`.

## Nova verzija stranice

```
cd build && npm install
python3 build.py ../src/FreshysSite.tsx ../data/catalog.json ../site
```

`build.py` u kodu zamijeni adrese `framerusercontent.com` s `/fu/`, preuzme slike i podatke koji nedostaju u `site/fu/`, složi `assets/app.<hash>.js` i `index.html`. Nakon toga commit i push na `main`: Vercel objavi sam.

## Domena

Vercel → projekt → Settings → Domains: `www.freshysfoods.com` (glavna) i `freshysfoods.com` (preusmjerenje 308 na www). DNS zapise koje Vercel pokaže upisati kod GoDaddyja.
