export type Place = {
  id: string;
  title: string;
  city: string;
  country: string;
  region: string;
  continent: string;
  lat: number;
  lng: number;
  date: string;
  camera: string;
  tags: string[];
  story: string;
  photos: string[];
};

export const places: Place[] = [
  {
    id: "tempe-2026-01",
    title: "Tempe Winter Light",
    city: "Tempe",
    country: "United States",
    region: "Arizona",
    continent: "North America",
    lat: 33.4255,
    lng: -111.94,
    date: "2026-01-25",
    camera: "Nikon Z 7 II",
    tags: ["Tempe", "Arizona", "Nikon Z 7 II"],
    story: "January frames from Tempe, Arizona.",
    photos: ["tempe-01.jpg", "tempe-02.jpg"],
  },
  {
    id: "lake-powell-2025-12",
    title: "Lake Powell",
    city: "Lake Powell",
    country: "United States",
    region: "Arizona",
    continent: "North America",
    lat: 36.9389,
    lng: -111.4846,
    date: "2025-12-17",
    camera: "Nikon Z 7 II",
    tags: ["Lake Powell", "Arizona", "landscape"],
    story: "Lake Powell, Arizona.",
    photos: ["lake-powell-01.jpg"],
  },
  {
    id: "monument-valley-2025-12",
    title: "Monument Valley",
    city: "Monument Valley",
    country: "United States",
    region: "Arizona / Utah",
    continent: "North America",
    lat: 36.998,
    lng: -110.0985,
    date: "2025-12-17",
    camera: "Nikon Z 7 II",
    tags: ["Monument Valley", "Arizona", "desert"],
    story: "Monument Valley, on the Arizona-Utah border.",
    photos: ["monument-valley-01.jpg"],
  },
  {
    id: "mauna-kea-2025-12",
    title: "Mauna Kea",
    city: "Mauna Kea",
    country: "United States",
    region: "Hawaii",
    continent: "North America",
    lat: 19.8207,
    lng: -155.4681,
    date: "2025-12-17",
    camera: "Nikon Z 7 II",
    tags: ["Mauna Kea", "Hawaii", "mountain"],
    story: "Frames from Mauna Kea, Hawaii.",
    photos: ["mauna-kea-01.jpg", "mauna-kea-02.jpg", "mauna-kea-03.jpg"],
  },
  {
    id: "hawaii-2025",
    title: "Hawaii",
    city: "Hawaii",
    country: "United States",
    region: "Hawaii",
    continent: "North America",
    lat: 19.8968,
    lng: -155.5828,
    date: "2025",
    camera: "Nikon Z 7 II",
    tags: ["Hawaii", "island", "Nikon Z 7 II"],
    story: "Hawaii frames that can be split into more precise places later.",
    photos: ["hawaii-01.jpg", "hawaii-02.jpg", "hawaii-03.jpg", "hawaii-04.jpg"],
  },
];

export function getPhotoUrl(filename: string) {
  return `${import.meta.env.BASE_URL}photos/${filename}`;
}

export function getCountryColor(country: string) {
  const palette: Record<string, string> = {
    China: "#2d72b8",
    France: "#7d6fce",
    Japan: "#d84f45",
    "United States": "#0f8b8d",
    "United Kingdom": "#c94b6b",
  };

  return palette[country] ?? "#0f8b8d";
}
