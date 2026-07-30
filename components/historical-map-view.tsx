'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';

interface CityData {
  name: string;
  years: Record<string, Record<string, number>>;
}

interface HistoricalMapViewProps {
  data: CityData[];
  selectedYear: number;
  selectedMetric: string;
  metricLabel: string;
  metricFormat: string;
  selectedCity: string;
  onSelectCity: (name: string) => void;
}

const LA_CENTER: [number, number] = [34.05, -118.25];

const CITY_COORDS: Record<string, [number, number]> = {
  "Agoura Hills": [34.1531, -118.7617],
  "Alhambra": [34.0953, -118.1270],
  "Arcadia": [34.1397, -117.9994],
  "Artesia": [33.8653, -118.0831],
  "Azusa": [34.1336, -117.9076],
  "Baldwin Park": [34.0853, -117.9606],
  "Bell": [33.9770, -118.1873],
  "Bell Gardens": [33.9659, -118.1512],
  "Bellflower": [33.8817, -118.1170],
  "Beverly Hills": [34.0736, -118.4004],
  "Bradbury": [34.1481, -117.9717],
  "Burbank": [34.1808, -118.3089],
  "Calabasas": [34.1583, -118.6581],
  "Carson": [33.8317, -118.2820],
  "Cerritos": [33.8584, -118.0648],
  "Claremont": [34.0967, -117.7198],
  "Commerce": [33.9961, -118.1609],
  "Compton": [33.8958, -118.2201],
  "Covina": [34.0900, -117.8903],
  "Cudahy": [33.9625, -118.1862],
  "Culver City": [34.0211, -118.3965],
  "Diamond Bar": [34.0289, -117.8103],
  "Downey": [33.9400, -118.1326],
  "Duarte": [34.1395, -117.9773],
  "El Monte": [34.0686, -118.0275],
  "El Segundo": [33.9192, -118.4165],
  "Gardena": [33.8883, -118.3089],
  "Glendale": [34.1425, -118.2551],
  "Glendora": [34.1361, -117.8653],
  "Hawaiian Gardens": [33.8306, -118.0720],
  "Hawthorne": [33.9164, -118.3526],
  "Hermosa Beach": [33.8622, -118.3995],
  "Hidden Hills": [34.1631, -118.6637],
  "Huntington Park": [33.9814, -118.2248],
  "Industry": [34.0153, -117.9581],
  "Inglewood": [33.9617, -118.3531],
  "Irwindale": [34.1064, -117.9281],
  "La Canada Flintridge": [34.2003, -118.2003],
  "LA City": [34.0522, -118.2437],
  "La Habra Heights": [33.9631, -117.9470],
  "La Mirada": [33.9017, -118.0123],
  "La Puente": [34.0203, -117.9498],
  "La Verne": [34.1006, -117.7678],
  "Lakewood": [33.8536, -118.1339],
  "Lancaster": [34.6986, -118.1368],
  "Lawndale": [33.8872, -118.3526],
  "Lomita": [33.7928, -118.3154],
  "Long Beach": [33.7701, -118.1937],
  "Lynwood": [33.9303, -118.2115],
  "Malibu": [34.0259, -118.7798],
  "Manhattan Beach": [33.8847, -118.4109],
  "Maywood": [33.9872, -118.1873],
  "Monrovia": [34.1442, -117.9998],
  "Montebello": [34.0153, -118.1137],
  "Monterey Park": [34.0625, -118.1228],
  "Norwalk": [33.9022, -118.0820],
  "Palmdale": [34.5794, -118.1165],
  "Palos Verdes Estates": [33.7870, -118.3937],
  "Paramount": [33.8892, -118.1595],
  "Pasadena": [34.1478, -118.1445],
  "Pico Rivera": [33.9831, -118.0970],
  "Pomona": [34.0553, -117.7500],
  "Rancho Palos Verdes": [33.7445, -118.3870],
  "Redondo Beach": [33.8492, -118.3884],
  "Rolling Hills": [33.7634, -118.3526],
  "Rolling Hills Estates": [33.7873, -118.3637],
  "Rosemead": [34.0806, -118.0728],
  "San Dimas": [34.1067, -117.8067],
  "San Fernando": [34.2820, -118.4384],
  "San Gabriel": [34.0961, -118.1056],
  "San Marino": [34.1211, -118.1067],
  "Santa Clarita": [34.3917, -118.5426],
  "Santa Fe Springs": [33.9467, -118.0609],
  "Santa Monica": [34.0195, -118.4912],
  "Sierra Madre": [34.1617, -118.0531],
  "Signal Hill": [33.8048, -118.1659],
  "South El Monte": [34.0517, -118.0459],
  "South Gate": [33.9547, -118.2120],
  "South Pasadena": [34.1153, -118.1506],
  "Temple City": [34.1067, -118.0581],
  "Torrance": [33.8358, -118.3406],
  "Vernon": [34.0042, -118.2220],
  "Walnut": [34.0211, -117.8612],
  "West Covina": [34.0686, -117.9386],
  "West Hollywood": [34.0900, -118.3617],
  "Westlake Village": [34.1459, -118.8198],
  "Whittier": [33.9792, -118.0326],
};

function getColor(value: number, metric: string, allValues: number[]): string {
  if (!allValues.length) return '#94a3b8';
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const normalized = max === min ? 0.5 : (value - min) / (max - min);

  // For metrics where higher is "worse" (poverty, no hs)
  const inverseMetrics = ['edu_no_hs_pct', 'housing_renter_pct'];
  const n = inverseMetrics.includes(metric) ? 1 - normalized : normalized;

  // Green → Yellow → Red gradient
  if (n > 0.66) return '#1D9E75';
  if (n > 0.33) return '#FFC107';
  return '#E57373';
}

function formatValue(val: number | undefined, format: string): string {
  if (val == null || isNaN(val)) return 'N/A';
  if (format === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  if (format === 'pct') return `${val.toFixed(1)}%`;
  return new Intl.NumberFormat('en-US').format(val);
}

export function HistoricalMapView({ data, selectedYear, selectedMetric, metricLabel, metricFormat, selectedCity, onSelectCity }: HistoricalMapViewProps) {
  const [clientReady, setClientReady] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => { setClientReady(true); }, []);

  // Get all metric values for this year for color scaling
  const allValues = data
    .map(c => c.years[String(selectedYear)]?.[selectedMetric])
    .filter((v): v is number => v != null && !isNaN(v));

  const maxPop = Math.max(...data.map(c => c.years[String(selectedYear)]?.population ?? 0));

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-border" style={{ height: 500 }}>
      {clientReady && (
        <MapContainer
          ref={mapRef}
          center={LA_CENTER}
          zoom={10}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map(city => {
            const coords = CITY_COORDS[city.name];
            if (!coords) return null;
            const yearData = city.years[String(selectedYear)] ?? {};
            const value = yearData[selectedMetric];
            const pop = yearData.population ?? 0;
            const radius = Math.max(5, Math.sqrt(pop / maxPop) * 30);
            const color = value != null ? getColor(value, selectedMetric, allValues) : '#94a3b8';
            const isSelected = city.name === selectedCity;

            return (
              <CircleMarker
                key={city.name}
                center={coords}
                radius={isSelected ? radius + 4 : radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.75,
                  color: isSelected ? '#1a56a0' : '#ffffff',
                  weight: isSelected ? 3 : 1,
                }}
                eventHandlers={{
                  click: () => onSelectCity(city.name),
                }}
              >
                <Tooltip direction="top" offset={[0, -5]}>
                  <div className="text-xs">
                    <p className="font-semibold">{city.name}</p>
                    <p>{metricLabel}: {formatValue(value, metricFormat)}</p>
                    <p>Population: {new Intl.NumberFormat('en-US').format(pop)}</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000] pointer-events-none text-xs">
        <p className="font-medium text-gray-700 mb-2">{metricLabel}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full inline-block" style={{backgroundColor:'#1D9E75'}}></span><span>Higher</span></div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full inline-block" style={{backgroundColor:'#FFC107'}}></span><span>Middle</span></div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full inline-block" style={{backgroundColor:'#E57373'}}></span><span>Lower</span></div>
        </div>
        <p className="text-gray-500 mt-2">Circle size = population</p>
      </div>
    </div>
  );
}
