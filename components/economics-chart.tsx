'use client';

import { useState } from 'react';
import { GeoArea, LanguageData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EconomicsChartProps {
  data: GeoArea;
  compareData?: GeoArea;
}

function formatPercent(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return 'N/A';
  return `${n.toFixed(1)}%`;
}

function safe(n: number | null | undefined): number {
  return n != null && !isNaN(n) ? n : 0;
}

const COLORS = [
  '#2E8B9A', '#F5B041', '#9B59B6', '#E57373', '#3498DB',
  '#1ABC9C', '#E67E22', '#E91E63', '#00BCD4', '#8BC34A',
];

export function EconomicsChart({ data }: EconomicsChartProps) {
  if (!data) return null;

  // Languages with full demographic data (IPUMS) or just lep_count
  const languages = data.languages ?? [];
  const hasDetailedLangData = languages.length > 0 && languages[0].poverty != null;

  // Selected language for drill-down (null = show overall)
  const [selectedLang, setSelectedLang] = useState<string | null>(null);

  const selectedLangData: LanguageData | null =
    selectedLang ? languages.find(l => l.name === selectedLang) ?? null : null;

  // Education chart data
  const eduSource = selectedLangData?.education ?? data.education;
  const educationData = eduSource ? [
    { name: 'Under 9th Grade', value: safe(eduSource.under_9th_pct) },
    { name: 'Incomplete HS', value: safe(eduSource.incomplete_hs_pct) },
    { name: 'HS / Some College', value: safe(eduSource.hs_some_college_pct) },
    { name: "Bachelor's+", value: safe(eduSource.ba_higher_pct) },
  ] : [];

  // Poverty chart data
  const povSource = selectedLangData?.poverty ?? data.poverty;
  const povertyData = povSource ? [
    { name: '1–124% FPL', value: safe(povSource.band_1_124_pct) },
    { name: '125–199% FPL', value: safe(povSource.band_125_199_pct) },
    { name: '200%+ FPL', value: safe((povSource as any).band_200_399_pct ?? (povSource as any).band_200plus_pct) },
    { name: '400%+ FPL', value: safe(povSource.band_400plus_pct) },
  ] : [];

  // Access metrics
  const accessSource = selectedLangData?.access ?? data.access;
  const housingSource = selectedLangData?.housing ?? data.housing;

  const accessMetrics = [
    { label: 'In a Linguistically Isolated Household', value: safe(accessSource?.linguistically_isolated_pct) },
    { label: 'No Internet Access', value: safe(accessSource?.no_internet_pct ?? data.no_internet_pct) },
    { label: 'No Computer Access', value: safe(accessSource?.no_computer_pct) },
    { label: 'SNAP Recipients', value: safe(accessSource?.snap_pct ?? data.snap_pct) },
  ];

  const housingMetrics = housingSource ? [
    { label: 'Owned Home', value: safe(housingSource.owned_home_pct) },
    { label: 'Renting (Paying)', value: safe(housingSource.rented_paying_pct) },
    { label: 'Renting (No Payment)', value: safe(housingSource.rented_no_payment_pct) },
    { label: 'Rent Burdened (>30%)', value: safe(housingSource.rent_burdened_pct), highlight: true },
  ] : [];

  return (
    <div className="space-y-4">

      {/* Language Selector — only show if detailed data exists */}
      {hasDetailedLangData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">View Data By Language Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLang(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedLang === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Overall
              </button>
              {languages.map((lang, i) => (
                <button
                  key={lang.name}
                  onClick={() => setSelectedLang(lang.name === selectedLang ? null : lang.name)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border-2 ${
                    selectedLang === lang.name
                      ? 'text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  style={selectedLang === lang.name ? {
                    backgroundColor: COLORS[i % COLORS.length],
                    borderColor: COLORS[i % COLORS.length],
                  } : {
                    borderColor: COLORS[i % COLORS.length],
                  }}
                >
                  {lang.name}
                  <span className="ml-1 opacity-70 text-xs">
                    ({new Intl.NumberFormat('en-US').format(lang.lep_count)})
                  </span>
                </button>
              ))}
            </div>
            {selectedLang && (
              <p className="mt-3 text-sm text-muted-foreground">
                Showing data for <strong className="text-foreground">{selectedLang}</strong> LEP speakers
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Education Chart */}
        {educationData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-sans">
                Education Attainment {selectedLang ? `— ${selectedLang}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={educationData} margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                    <Tooltip
  content={() => <></>}
/>
<Bar dataKey="value" fill="#2E8B9A" radius={[4, 4, 0, 0]}
  label={{ position: 'top', formatter: (v: number) => `${v.toFixed(1)}%`, fontSize: 13, fill: 'hsl(var(--foreground))' }}
/>                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Poverty Chart */}
        {povertyData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-sans">
                Poverty Level {selectedLang ? `— ${selectedLang}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={povertyData} margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                    <Tooltip
  content={() => <></>}
/>
                    <Bar dataKey="value" fill="#E57373" radius={[4, 4, 0, 0]}
  label={{ position: 'top', formatter: (v: number) => `${v.toFixed(1)}%`, fontSize: 13, fill: 'hsl(var(--foreground))' }}
/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Access Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans">
            Digital & Resource Access {selectedLang ? `— ${selectedLang}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accessMetrics.map(({ label, value }) => (
              <div key={label} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-lg font-semibold text-foreground">{formatPercent(value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Housing Metrics */}
      {housingMetrics.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">
              Housing {selectedLang ? `— ${selectedLang}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {housingMetrics.map(({ label, value, highlight }) => (
                <div key={label} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className={`text-lg font-semibold ${highlight && value > 30 ? 'text-destructive' : 'text-foreground'}`}>
                    {formatPercent(value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
