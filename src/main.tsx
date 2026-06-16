import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
  type Popup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";
import { getCountryColor, getPhotoUrl, places, type Place } from "./data/places";

const mapStyle: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osmStandard: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: "osmStandard",
      type: "raster",
      source: "osmStandard",
    },
  ],
};

const totalPhotoCount = places.reduce((sum, place) => sum + place.photos.length, 0);

function getGeoJson() {
  return {
    type: "FeatureCollection" as const,
    features: places.map((place) => ({
      type: "Feature" as const,
      properties: {
        id: place.id,
        city: place.city,
        country: place.country,
        region: place.region,
        color: getCountryColor(place.country),
        photoCount: place.photos.length,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [place.lng, place.lat],
      },
    })),
  };
}

function App() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?.id ?? "");
  const [gallery, setGallery] = useState<{ placeId: string; index: number } | null>(null);

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedPlaceId) ?? places[0],
    [selectedPlaceId],
  );

  const galleryPlace = gallery ? places.find((place) => place.id === gallery.placeId) : null;
  const galleryFilename = galleryPlace && gallery ? galleryPlace.photos[gallery.index] : null;

  const fitPlaces = () => {
    const map = mapRef.current;
    if (!map || !places.length) return;

    const bounds = places.reduce(
      (nextBounds, place) => nextBounds.extend([place.lng, place.lat]),
      new maplibregl.LngLatBounds([places[0].lng, places[0].lat], [places[0].lng, places[0].lat]),
    );

    map.fitBounds(bounds, {
      padding: window.innerWidth < 720 ? 54 : 92,
      duration: 800,
      maxZoom: 5.4,
    });
  };

  const focusPlace = (placeId: string, openGallery = false) => {
    const place = places.find((item) => item.id === placeId);
    if (!place) return;

    setSelectedPlaceId(place.id);
    mapRef.current?.flyTo({
      center: [place.lng, place.lat],
      zoom: Math.max(mapRef.current.getZoom(), 5.1),
      duration: 900,
    });

    if (openGallery) {
      setGallery({ placeId: place.id, index: 0 });
    }
  };

  const movePhoto = (delta: number) => {
    if (!galleryPlace || !gallery) return;
    setGallery({
      placeId: gallery.placeId,
      index: (gallery.index + delta + galleryPlace.photos.length) % galleryPlace.photos.length,
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [-122, 31],
      zoom: window.innerWidth < 720 ? 1.6 : 2.1,
      attributionControl: false,
    });

    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 14,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("places", {
        type: "geojson",
        data: getGeoJson(),
      });

      map.addLayer({
        id: "place-halo",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 8, 6, 18],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.16,
          "circle-stroke-width": 0,
        },
      });

      map.addLayer({
        id: "place-points",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 4, 6, 8],
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      map.addLayer({
        id: "place-labels",
        type: "symbol",
        source: "places",
        minzoom: 2.2,
        layout: {
          "text-field": ["get", "city"],
          "text-offset": [0, 1.15],
          "text-size": 12,
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#24302e",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.3,
        },
      });

      map.on("mouseenter", "place-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "place-points", () => {
        map.getCanvas().style.cursor = "";
        popupRef.current?.remove();
      });

      map.on("mousemove", "place-points", (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;

        const { city, country, region } = feature.properties as {
          city: string;
          country: string;
          region: string;
        };

        popupRef.current
          ?.setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(`<p class="popup-title">${city}</p><p class="popup-meta">${region}, ${country}</p>`)
          .addTo(map);
      });

      map.on("click", "place-points", (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature || feature.geometry.type !== "Point") return;
        const { id } = feature.properties as { id: string };
        popupRef.current?.remove();
        focusPlace(id, true);
      });

      fitPlaces();
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!gallery) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [gallery]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="回到摄影足迹首页">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <strong>Footprint</strong>
            <small>摄影足迹</small>
          </span>
        </a>
        <nav className="top-actions" aria-label="页面操作">
          <a className="text-link" href="#places">
            地点
          </a>
        </nav>
      </header>

      <main>
        <section className="map-workspace" aria-label="摄影足迹地图">
          <section className="map-panel">
            <div ref={mapContainerRef} className="map-canvas" aria-label="可交互世界地图" />
            <div className="map-controls" aria-label="地图控制">
              <button className="icon-button" type="button" title="放大" onClick={() => mapRef.current?.zoomIn()}>
                +
              </button>
              <button className="icon-button" type="button" title="缩小" onClick={() => mapRef.current?.zoomOut()}>
                -
              </button>
              <button className="icon-button" type="button" title="显示全部地点" onClick={fitPlaces}>
                ◎
              </button>
            </div>
          </section>
        </section>

        <section className="content-band" id="places" aria-label="地点列表">
          <div className="section-heading">
            <p className="eyebrow">Places</p>
            <h2>按地点整理作品</h2>
            <p className="section-note">
              {places.length} places · {totalPhotoCount} photos
            </p>
          </div>
          <div className="place-list">
            {places.map((place) => (
              <article
                className={`place-card ${place.id === selectedPlace?.id ? "is-selected" : ""}`}
                key={place.id}
                onClick={() => focusPlace(place.id, true)}
                style={{ "--dot": getCountryColor(place.country) } as React.CSSProperties}
              >
                <div className="place-card-top">
                  <div>
                    <p className="eyebrow">
                      {place.region} · {place.country}
                    </p>
                    <h3>{place.city}</h3>
                  </div>
                  <span className="place-dot" aria-hidden="true" />
                </div>
                <p>{place.story}</p>
                <div className="tag-row">
                  {place.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {gallery && galleryPlace && galleryFilename && (
        <div className="lightbox is-open" aria-hidden="false" role="dialog" aria-label="照片浏览">
          <button className="lightbox-backdrop" type="button" onClick={() => setGallery(null)} aria-label="关闭" />
          <article className="lightbox-dialog" aria-live="polite">
            <div className="lightbox-media">
              <button className="lightbox-nav previous" type="button" onClick={() => movePhoto(-1)} title="上一张">
                ‹
              </button>
              <img src={getPhotoUrl(galleryFilename)} alt={`${galleryPlace.city} photo ${gallery.index + 1}`} />
              <button className="lightbox-nav next" type="button" onClick={() => movePhoto(1)} title="下一张">
                ›
              </button>
            </div>
            <footer className="lightbox-caption">
              <div>
                <p>
                  {galleryPlace.city}, {galleryPlace.country}
                </p>
                <h3>{galleryPlace.city}</h3>
                <span>
                  {gallery.index + 1} / {galleryPlace.photos.length} · {galleryPlace.camera}
                </span>
              </div>
              <button className="icon-button" type="button" onClick={() => setGallery(null)} title="关闭">
                ×
              </button>
            </footer>
          </article>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
