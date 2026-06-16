# Footprint

A personal photography footprint website built with React, Vite, TypeScript, and MapLibre GL JS.

The GitHub Pages URL is intended to be:

```text
https://yunfanzeng00194.github.io/footprint/
```

## Install Dependencies

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Vite will print a local URL such as `http://localhost:5173/`.

## Add Photos

1. Put web-ready photos in `public/photos/`.
2. Name photos with the `location-number.jpg` pattern, for example:
   - `phoenix-01.jpg`
   - `phoenix-02.jpg`
   - `new-york-01.jpg`
   - `beijing-01.jpg`
   - `honolulu-01.jpg`
3. Open `src/data/places.ts`.
4. Add only filenames to the place `photos` array:

```ts
photos: ["phoenix-01.jpg", "phoenix-02.jpg"];
```

Do not store full photo URLs in `src/data/places.ts`. The app uses `getPhotoUrl(filename)` and `import.meta.env.BASE_URL` so photos work correctly under `/footprint/` on GitHub Pages.

## Add A New Place

Add a new object to the `places` array in `src/data/places.ts`:

```ts
{
  id: "phoenix-2026",
  title: "Phoenix Light",
  city: "Phoenix",
  country: "United States",
  region: "Arizona",
  continent: "North America",
  lat: 33.4484,
  lng: -112.074,
  date: "2026-01",
  camera: "Nikon Z 7 II",
  tags: ["Phoenix", "Arizona"],
  story: "A short note about this set.",
  photos: ["phoenix-01.jpg", "phoenix-02.jpg"],
}
```

Use map coordinates as `lat` and `lng`. The first value in a copied coordinate pair is usually latitude, and the second value is longitude.

## Deploy To GitHub Pages

This project is configured for GitHub Pages at `/footprint/`:

- `vite.config.ts` sets `base: "/footprint/"`
- `.github/workflows/deploy.yml` builds the site and deploys `dist`

After pushing the repository, go to:

```text
GitHub repository -> Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

Make sure GitHub Actions is selected.

## Push Changes

```bash
git add .
git commit -m "Update footprint website"
git push
```
