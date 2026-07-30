'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HistoricalMapView = dynamic(() => import('@/components/historical-map-view').then(m => m.HistoricalMapView), { ssr: false, loading: () => <div className="h-[500px] w-full rounded-lg bg-muted animate-pulse" /> });

const YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010];

const METRICS = [
  { key: 'population', label: 'Total Population', format: 'number', category: 'Population' },
  { key: 'white_pct', label: '% White non-Hispanic', format: 'pct', category: 'Race & Ethnicity' },
  { key: 'hispanic_pct', label: '% Hispanic', format: 'pct', category: 'Race & Ethnicity' },
  { key: 'black_pct', label: '% Black', format: 'pct', category: 'Race & Ethnicity' },
  { key: 'asian_pct', label: '% Asian', format: 'pct', category: 'Race & Ethnicity' },
  { key: 'foreign_born_pct', label: '% Foreign Born', format: 'pct', category: 'Nativity' },
  { key: 'born_mexico_pct', label: '% Born in Mexico', format: 'pct', category: 'Nativity' },
  { key: 'born_asia_pct', label: '% Born in Asia', format: 'pct', category: 'Nativity' },
  { key: 'born_middle_east_pct', label: '% Born in Middle East', format: 'pct', category: 'Nativity' },
  { key: 'median_hh_income', label: 'Median Household Income', format: 'currency', category: 'Economics' },
  { key: 'occ_white_collar_pct', label: '% White Collar', format: 'pct', category: 'Economics' },
  { key: 'occ_blue_collar_pct', label: '% Blue Collar', format: 'pct', category: 'Economics' },
  { key: 'females_labor_force_pct', label: '% Females in Labor Force', format: 'pct', category: 'Economics' },
  { key: 'edu_no_hs_pct', label: '% No HS Diploma', format: 'pct', category: 'Education' },
  { key: 'edu_hs_only_pct', label: '% HS Only', format: 'pct', category: 'Education' },
  { key: 'edu_some_college_pct', label: '% Some College', format: 'pct', category: 'Education' },
  { key: 'edu_college_pct', label: '% College Graduate', format: 'pct', category: 'Education' },
  { key: 'median_age', label: 'Median Age', format: 'number', category: 'Age' },
  { key: 'age_65plus_pct', label: '% Age 65+', format: 'pct', category: 'Age' },
  { key: 'housing_owner_pct', label: '% Owner-Occupied', format: 'pct', category: 'Housing' },
  { key: 'median_house_value', label: 'Median House Value', format: 'currency', category: 'Housing' },
  { key: 'median_rent', label: 'Median Rent', format: 'currency', category: 'Housing' },
];

const CATEGORIES = ['Population', 'Race & Ethnicity', 'Nativity', 'Economics', 'Education', 'Age', 'Housing'];
const COLORS = ['#2E8B9A', '#F5B041', '#9B59B6', '#E57373', '#3498DB', '#1ABC9C', '#E67E22'];

function formatValue(val: number | undefined, format: string): string {
  if (val == null || isNaN(val)) return 'N/A';
  if (format === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  if (format === 'pct') return `${val.toFixed(1)}%`;
  return new Intl.NumberFormat('en-US').format(val);
}

interface CityData {
  name: string;
  years: Record<string, Record<string, number>>;
}

export default function HistoricalPage() {
  const [data, setData] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Burbank');
  const [selectedYear, setSelectedYear] = useState<number>(2010);
  const [selectedMetric, setSelectedMetric] = useState<string>('hispanic_pct');
  const [selectedCategory, setSelectedCategory] = useState<string>('Race & Ethnicity');
  const [viewMode, setViewMode] = useState<'map' | 'trends' | 'compare'>('map');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    fetch('/data/historical.json')
      .then(r => r.json())
      .then((d: CityData[]) => {
        const cities = d.filter(c => c.name !== 'LA County');
        setData(cities);
      })
      .catch(console.error);
  }, []);

  const city = data.find(d => d.name === selectedCity);
  const categoryMetrics = METRICS.filter(m => m.category === selectedCategory);
  const currentMetric = METRICS.find(m => m.key === selectedMetric);

  const trendData = YEARS.map(year => {
    const yearData = city?.years[String(year)] ?? {};
    const point: Record<string, number | string> = { year: String(year) };
    categoryMetrics.forEach(m => {
      if (yearData[m.key] != null) point[m.key] = yearData[m.key];
    });
    return point;
  });

  const compareData = data
    .map(c => ({ name: c.name, value: c.years[String(selectedYear)]?.[selectedMetric] }))
    .filter(d => d.value != null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  return (
    <div className="min-h-screen bg-background">

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full p-8 z-10">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Historical Demographics</h2>
            <p className="text-sm text-muted-foreground italic mb-6">Los Angeles County 1950–2010</p>
            <div className="space-y-3 text-sm text-foreground">
              <p>
                This section presents historical demographic data for 88 cities and communities across Los Angeles County, spanning seven decades of census data from 1950 to 2010.
              </p>
              <p>
                Data includes population, race & ethnicity, nativity, education, occupation, income, age, and housing characteristics for each census year.
              </p>
              <div className="pt-3 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-1">Data Source</p>
                <p className="text-xs text-muted-foreground">
                  Los Angeles County Demographic Data Project 1950–2010, USC Libraries Digital Collections. Compiled by Becky M. Nicolaides & U.S. Department of Commerce.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="mt-6 w-full py-2.5 rounded-full text-sm font-semibold bg-[#2E8B9A] text-white hover:bg-[#267a88] transition-colors"
            >
              Explore the Data →
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Historical Demographics</h1>
        <p className="text-sm text-muted-foreground mt-1">Los Angeles County 1950–2010 · USC Digital Library</p>
      </div>

      {/* Controls */}
      <div className="border-b border-border bg-card px-6 py-3 flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['map', 'trends', 'compare'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${viewMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
              {mode === 'map' ? 'Map' : mode === 'trends' ? 'City Trends' : 'Compare Cities'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">Year:</span>
          {YEARS.map(y => (
            <button key={y} onClick={() => setSelectedYear(y)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedYear === y ? 'bg-[#2E8B9A] text-white' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
              {y}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); const first = METRICS.find(m => m.category === cat); if (first) setSelectedMetric(first.key); }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {categoryMetrics.map(m => (
            <button key={m.key} onClick={() => setSelectedMetric(m.key)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedMetric === m.key ? 'bg-[#2E8B9A] text-white' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
              {m.label}
            </button>
          ))}
        </div>

        {viewMode === 'map' && (
          <>
            <HistoricalMapView
              data={data}
              selectedYear={selectedYear}
              selectedMetric={selectedMetric}
              metricLabel={currentMetric?.label ?? ''}
              metricFormat={currentMetric?.format ?? 'number'}
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
            />
            {city && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-sans">{selectedCity} — {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryMetrics.map(m => (
                      <div key={m.key} className={`p-3 rounded-lg ${selectedMetric === m.key ? 'bg-[#2E8B9A]/10 border border-[#2E8B9A]/30' : 'bg-muted/50'}`}>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-lg font-bold text-foreground">{formatValue(city.years[String(selectedYear)]?.[m.key], m.format)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {viewMode === 'trends' && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">City:</span>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground">
                {data.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans">{selectedCategory} — {selectedCity} 1950–2010</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v =>
                        currentMetric?.format === 'currency' ? `$${(v/1000).toFixed(0)}k` :
                        currentMetric?.format === 'pct' ? `${v}%` :
                        new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)} />
                      <Tooltip formatter={(value: number, name: string) => {
                        const m = METRICS.find(x => x.key === name);
                        return [formatValue(value, m?.format ?? 'number'), m?.label ?? name];
                      }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {categoryMetrics.map((m, i) => (
                        <Line key={m.key} type="monotone" dataKey={m.key} name={m.label}
                          stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans">Full Data Table — {selectedCity}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Metric</th>
                        {YEARS.map(y => <th key={y} className="text-right py-2 px-2 text-muted-foreground font-medium">{y}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {categoryMetrics.map(m => (
                        <tr key={m.key} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 pr-4 text-foreground">{m.label}</td>
                          {YEARS.map(y => (
                            <td key={y} className="text-right py-2 px-2 text-muted-foreground">
                              {formatValue(city?.years[String(y)]?.[m.key], m.format)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {viewMode === 'compare' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-sans">{currentMetric?.label} — All Cities, {selectedYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: Math.max(400, compareData.length * 22) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData} layout="vertical" margin={{ left: 130, right: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }}
                      tickFormatter={v => currentMetric?.format === 'currency' ? `$${(v/1000).toFixed(0)}k` : currentMetric?.format === 'pct' ? `${v}%` : String(v)} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={125} />
                    <Tooltip formatter={(value: number) => [formatValue(value, currentMetric?.format ?? 'number'), currentMetric?.label]}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                    <Bar dataKey="value" fill="#2E8B9A" radius={[0, 4, 4, 0]}
                      label={{ position: 'right', formatter: (v: number) => formatValue(v, currentMetric?.format ?? 'number'), fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Source: Los Angeles County Demographic Data Project 1950–2010, USC Libraries Digital Collections · Nicolaides, Becky M. & U.S. Department of Commerce
        </p>
      </div>
    </div>
  );
}
