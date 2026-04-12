'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GeoArea, GeoType } from '@/lib/types';

interface MapPanelProps {
  geographyType: GeoType;
  data: GeoArea[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  colorMetric: 'population' | 'median_hh_income' | 'lep_pct';
}

const LA_CENTER: [number, number] = [-118.2437, 34.0522];
const LA_BOUNDS: [[number, number], [number, number]] = [
  [-118.9448, 33.7037],
  [-117.6462, 34.8233],
];

const GEO_FILES: Record<GeoType, string> = {
  county: '/geo/county.geojson',
  puma: '/geo/pumas.geojson',
  city: '/geo/cities.geojson',
  zip: '/geo/zips.geojson',
};

function getFeatureGeoId(type: GeoType, props: Record<string, unknown> | null): string | null {
  if (!props) return null;
  switch (type) {
    case 'county':
      return props.GEOID != null ? String(props.GEOID) : null;
    case 'puma':
      return props.GEOID10 != null ? String(props.GEOID10) : null;
    case 'city':
      return props.GEOID != null ? String(props.GEOID) : null;
    case 'zip':
      return props.GEOID20 != null ? String(props.GEOID20) : null;
    default:
      return null;
  }
}

function getColorScale(metric: 'population' | 'median_hh_income' | 'lep_pct') {
  switch (metric) {
    case 'population':
      return ['#E8F4F8', '#B8DDE6', '#6BB8CC', '#2E8B9A', '#1A5F6B'];
    case 'median_hh_income':
      return ['#FEF3E2', '#FCD9A8', '#F5B041', '#D4A03A', '#8B6914'];
    case 'lep_pct':
      return ['#E8F4F8', '#B8DDE6', '#6BB8CC', '#2E8B9A', '#1A5F6B'];
    default:
      return ['#E8F4F8', '#B8DDE6', '#6BB8CC', '#2E8B9A', '#1A5F6B'];
  }
}

function getMetricValue(item: GeoArea, metric: 'population' | 'median_hh_income' | 'lep_pct'): number {
  switch (metric) {
    case 'population':
      return item.population ?? 0;
    case 'median_hh_income':
      return item.median_hh_income ?? 0;
    case 'lep_pct':
      return item.lep_pct ?? 0;
    default:
      return 0;
  }
}

function fillOpacityExpr(selected: string | null): mapboxgl.ExpressionSpecification {
  const sel = selected ?? '';
  return ['case', ['==', ['get', '_gid'], sel], 0.92, 0.62] as mapboxgl.ExpressionSpecification;
}

function lineWidthExpr(selected: string | null): mapboxgl.ExpressionSpecification {
  const sel = selected ?? '';
  return ['case', ['==', ['get', '_gid'], sel], 2.5, 0.6] as mapboxgl.ExpressionSpecification;
}

export function MapPanel({ geographyType, data, selectedId, onSelect, colorMetric }: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const onSelectRef = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);
  onSelectRef.current = onSelect;
  selectedIdRef.current = selectedId;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    // Next.js/Turbopack does not bundle the Mapbox worker reliably; use the CSP worker from Mapbox CDN.
    mapboxgl.workerUrl = `https://api.mapbox.com/mapbox-gl-js/v${mapboxgl.version}/mapbox-gl-csp-worker.js`;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: LA_CENTER,
      zoom: 9,
      maxBounds: LA_BOUNDS,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    resizeObserver.observe(mapContainer.current);

    map.current.on('load', () => {
      map.current?.resize();
      setMapLoaded(true);
    });

    return () => {
      resizeObserver.disconnect();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      setMapLoaded(false);
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !Array.isArray(data) || data.length === 0) return;

    const mapInstance = map.current;
    let cancelled = false;

    const removeGeoLayers = () => {
      if (mapInstance.getLayer('geo-outline')) mapInstance.removeLayer('geo-outline');
      if (mapInstance.getLayer('geo-fill')) mapInstance.removeLayer('geo-fill');
      if (mapInstance.getSource('geo')) mapInstance.removeSource('geo');
    };

    const onClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      const gid = f?.properties && typeof f.properties._gid === 'string' ? f.properties._gid : null;
      if (gid) onSelectRef.current(gid);
    };
    const onEnter = () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    };
    const onLeave = () => {
      mapInstance.getCanvas().style.cursor = '';
    };

    async function loadGeoLayers() {
      const url = GEO_FILES[geographyType];
      const res = await fetch(url);
      if (!res.ok || cancelled) return;
      const geojson = (await res.json()) as GeoJSON.FeatureCollection;

      const colors = getColorScale(colorMetric);
      const values = data.map((item) => getMetricValue(item, colorMetric));
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = maxVal - minVal || 1;
      const byId = new Map(data.map((d) => [d.geo_id, d]));

      for (const f of geojson.features) {
        if (!f.properties || typeof f.properties !== 'object') continue;
        const props = f.properties as Record<string, unknown>;
        const gid = getFeatureGeoId(geographyType, props);
        if (!gid) continue;
        const row = byId.get(gid);
        const value = row ? getMetricValue(row, colorMetric) : 0;
        const normalizedValue = (value - minVal) / range;
        const colorIndex = Math.min(Math.floor(normalizedValue * colors.length), colors.length - 1);
        props._gid = gid;
        props._color = colors[colorIndex];
      }

      if (cancelled) return;

      removeGeoLayers();

      mapInstance.addSource('geo', { type: 'geojson', data: geojson });

      const sel = selectedIdRef.current;
      mapInstance.addLayer({
        id: 'geo-fill',
        type: 'fill',
        source: 'geo',
        paint: {
          'fill-color': ['get', '_color'] as mapboxgl.ExpressionSpecification,
          'fill-opacity': fillOpacityExpr(sel),
        },
      });

      mapInstance.addLayer({
        id: 'geo-outline',
        type: 'line',
        source: 'geo',
        paint: {
          'line-color': '#ffffff',
          'line-width': lineWidthExpr(sel),
        },
      });

      mapInstance.fitBounds(LA_BOUNDS, { padding: 48, duration: 600 });

      mapInstance.off('click', 'geo-fill', onClick);
      mapInstance.off('mouseenter', 'geo-fill', onEnter);
      mapInstance.off('mouseleave', 'geo-fill', onLeave);
      mapInstance.on('click', 'geo-fill', onClick);
      mapInstance.on('mouseenter', 'geo-fill', onEnter);
      mapInstance.on('mouseleave', 'geo-fill', onLeave);
    }

    loadGeoLayers().catch((err) => console.error('Map geo load failed:', err));

    return () => {
      cancelled = true;
      mapInstance.off('click', 'geo-fill', onClick);
      mapInstance.off('mouseenter', 'geo-fill', onEnter);
      mapInstance.off('mouseleave', 'geo-fill', onLeave);
      removeGeoLayers();
    };
  }, [data, geographyType, colorMetric, mapLoaded]);

  useEffect(() => {
    const m = map.current;
    if (!m || !mapLoaded || !m.getLayer('geo-fill')) return;
    m.setPaintProperty('geo-fill', 'fill-opacity', fillOpacityExpr(selectedId));
    if (m.getLayer('geo-outline')) {
      m.setPaintProperty('geo-outline', 'line-width', lineWidthExpr(selectedId));
    }
  }, [selectedId, mapLoaded]);

  return (
    <div className="relative h-full w-full min-h-[300px] rounded-lg overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0 min-h-[300px]" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-10 pointer-events-none">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {colorMetric === 'population' && 'Population'}
          {colorMetric === 'median_hh_income' && 'Median Income'}
          {colorMetric === 'lep_pct' && 'LEP Rate'}
        </p>
        <div className="flex items-center gap-1">
          {getColorScale(colorMetric).map((color, i) => (
            <div
              key={i}
              className="w-6 h-3 first:rounded-l last:rounded-r"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
