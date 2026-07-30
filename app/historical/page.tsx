'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';

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
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(2010);
  const [selectedMetric, setSelectedMetric] = useState<string>('hispanic_pct');
  const [selectedCategory, setSelectedCategory] = useState<string>('Race & Ethnicity');
  const [viewMode, setViewMode] = useState<'trends' | 'snapshot'>('trends');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    fetch('/data/historical.json')
      .then(r => r.json())
      .then((d: CityData[]) => {
        setData(d);
        if (d.length > 0) setSelectedCity(d[0].name);
      })
      .catch(console.error);
  }, []);

  const city = data.find(d => d.name === selectedCity);
  const categoryMetrics = METRICS.filter(m => m.category === selectedCategory);
  const currentMetric = METRICS.find(m => m.key === selectedMetric);

  // Build trend chart data for selected city
  const trendData = YEARS.map(year => {
    const yearData = city?.years[String(year)] ?? {};
    const point: Record<string, number | string> = { year: String(year) };
    categoryMetrics.forEach(m => {
      if (yearData[m.key] != null) point[m.key] = yearData[m.key];
    });
    return point;
  });

  // Build snapshot data — all cities for selected year + metric
  const snapshotData = data
    .map(c => ({
      name: c.name,
      value: c.years[String(selectedYear)]?.[selectedMetric],
    }))
    .filter(d => d.value != null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  return (
    <div className="min-h-screen bg-background">
        <Header />
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Historical Demographics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Los Angeles County 1950–2010 · USC Digital Library
        </p>
      </div>

      {/* Controls */}
      <div className="border-b border-border bg-card px-6 py-3 flex flex-wrap items-center gap-4">
        {/* View toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setViewMode('trends')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${viewMode === 'trends' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          >
            City Trends
          </button>
          <button
            onClick={() => setViewMode('snapshot')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${viewMode === 'snapshot' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          >
            Compare Cities
          </button>
        </div>

        {/* City selector (trends mode) */}
        {viewMode === 'trends' && (
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground"
          >
            {data.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        )}

        {/* Year selector (snapshot mode) */}
        {viewMode === 'snapshot' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Year:</span>
            {YEARS.map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedYear === y ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {/* Category selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                const first = METRICS.find(m => m.category === cat);
                if (first) setSelectedMetric(first.key);
              }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedCategory === cat ? 'bg-[#2E8B9A] text-white' : 'border border-border text-muted-foreground hover:bg-muted'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {viewMode === 'trends' && city && (
          <>
            {/* Summary stats for selected city */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['population', 'hispanic_pct', 'foreign_born_pct', 'edu_college_pct'].map(key => {
                const m = METRICS.find(x => x.key === key)!;
                const val1950 = city.years['1950']?.[key];
                const val2010 = city.years['2010']?.[key];
                const change = val1950 != null && val2010 != null ? val2010 - val1950 : null;
                return (
                  <Card key={key}>
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="text-xl font-bold text-foreground mt-1">{formatValue(val2010, m.format)}</p>
                      <p className="text-xs text-muted-foreground">2010</p>
                      {change != null && (
                        <p className={`text-xs mt-1 ${change > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {change > 0 ? '+' : ''}{m.format === 'pct' ? `${change.toFixed(1)}pp` : m.format === 'currency' ? formatValue(change, 'currency') : new Intl.NumberFormat('en-US').format(change)} since 1950
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Trend charts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans">{selectedCategory} — {city.name} 1950–2010</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={v =>
                        currentMetric?.format === 'currency' ? `$${(v/1000).toFixed(0)}k` :
                        currentMetric?.format === 'pct' ? `${v}%` : new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)
                      } />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          const m = METRICS.find(x => x.key === name);
                          return [formatValue(value, m?.format ?? 'number'), m?.label ?? name];
                        }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {categoryMetrics.map((m, i) => (
                        <Line
                          key={m.key}
                          type="monotone"
                          dataKey={m.key}
                          name={m.label}
                          stroke={COLORS[i % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Year-by-year table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans">Full Data Table — {city.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Metric</th>
                        {YEARS.map(y => (
                          <th key={y} className="text-right py-2 px-2 text-muted-foreground font-medium">{y}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categoryMetrics.map(m => (
                        <tr key={m.key} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 pr-4 text-foreground">{m.label}</td>
                          {YEARS.map(y => (
                            <td key={y} className="text-right py-2 px-2 text-muted-foreground">
                              {formatValue(city.years[String(y)]?.[m.key], m.format)}
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

        {viewMode === 'snapshot' && (
          <>
            {/* Metric selector */}
            <div className="flex flex-wrap gap-2">
              {categoryMetrics.map(m => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMetric(m.key)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedMetric === m.key ? 'bg-[#2E8B9A] text-white' : 'border border-border text-muted-foreground hover:bg-muted'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Bar chart comparing all cities */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans">
                  {currentMetric?.label} — All Cities, {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: Math.max(300, snapshotData.length * 28) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snapshotData} layout="vertical" margin={{ left: 120, right: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 10 }}
                        tickFormatter={v => currentMetric?.format === 'currency' ? `$${(v/1000).toFixed(0)}k` : currentMetric?.format === 'pct' ? `${v}%` : String(v)}
                      />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={115} />
                      <Tooltip
                        formatter={(value: number) => [formatValue(value, currentMetric?.format ?? 'number'), currentMetric?.label]}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                      />
                      <Bar dataKey="value" fill="#2E8B9A" radius={[0, 4, 4, 0]}
                        label={{ position: 'right', formatter: (v: number) => formatValue(v, currentMetric?.format ?? 'number'), fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {data.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">Loading historical data...</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Source: Los Angeles County Demographic Data Project 1950–2010, USC Libraries Digital Collections
        </p>
      </div>
      
    </div>
  );
}
