'use client';

import { GeoArea, LA_COUNTY_BENCHMARK } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from 'recharts';

interface EconomicsChartProps {
  data: GeoArea;
  compareData?: GeoArea;
}

function formatCurrency(n: number | null): string {
  if (n === null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function EconomicsChart({ data, compareData }: EconomicsChartProps) {
  if (!data) {
    return null;
  }

  const educationData = data.education ? [
    {
      name: 'Under 9th',
      [data.name]: data.education.under_9th_pct,
      ...(compareData?.education ? { [compareData.name]: compareData.education.under_9th_pct } : {}),
    },
    {
      name: 'Incomplete HS',
      [data.name]: data.education.incomplete_hs_pct,
      ...(compareData?.education ? { [compareData.name]: compareData.education.incomplete_hs_pct } : {}),
    },
    {
      name: 'HS/Some College',
      [data.name]: data.education.hs_some_college_pct,
      ...(compareData?.education ? { [compareData.name]: compareData.education.hs_some_college_pct } : {}),
    },
    {
      name: "Bachelor's+",
      [data.name]: data.education.ba_higher_pct,
      ...(compareData?.education ? { [compareData.name]: compareData.education.ba_higher_pct } : {}),
    },
  ] : [];

  const radarData = [
    {
      metric: 'Low LEP',
      [data.name]: Math.max(0, 100 - data.lep_pct),
      ...(compareData ? { [compareData.name]: Math.max(0, 100 - compareData.lep_pct) } : {}),
      fullMark: 100,
    },
    {
      metric: 'Low Poverty',
      [data.name]: Math.max(0, 100 - data.poverty_pct),
      ...(compareData ? { [compareData.name]: Math.max(0, 100 - compareData.poverty_pct) } : {}),
      fullMark: 100,
    },
    {
      metric: 'Internet Access',
      [data.name]: Math.max(0, 100 - data.no_internet_pct),
      ...(compareData ? { [compareData.name]: Math.max(0, 100 - compareData.no_internet_pct) } : {}),
      fullMark: 100,
    },
    {
      metric: 'Education',
      [data.name]: data.education?.ba_higher_pct ?? 0,
      ...(compareData ? { [compareData.name]: compareData.education?.ba_higher_pct ?? 0 } : {}),
      fullMark: 100,
    },
    {
      metric: 'Low SNAP',
      [data.name]: Math.max(0, 100 - data.snap_pct),
      ...(compareData ? { [compareData.name]: Math.max(0, 100 - compareData.snap_pct) } : {}),
      fullMark: 100,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {educationData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">Education Attainment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={educationData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey={data.name} fill="#2E8B9A" radius={[4, 4, 0, 0]} />
                  {compareData && (
                    <Bar dataKey={compareData.name} fill="#F5B041" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans">Community Wellbeing Index</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <Radar
                  name={data.name}
                  dataKey={data.name}
                  stroke="#2E8B9A"
                  fill="#2E8B9A"
                  fillOpacity={0.3}
                />
                {compareData && (
                  <Radar
                    name={compareData.name}
                    dataKey={compareData.name}
                    stroke="#F5B041"
                    fill="#F5B041"
                    fillOpacity={0.3}
                  />
                )}
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [formatPercent(value), '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans">Key Indicators vs LA County</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="LEP Rate"
              value={formatPercent(data.lep_pct)}
              benchmark={formatPercent(LA_COUNTY_BENCHMARK.lep_pct)}
              compareValue={compareData ? formatPercent(compareData.lep_pct) : undefined}
              isHigherBetter={false}
              primary={data.lep_pct}
              secondary={compareData?.lep_pct}
            />
            <MetricCard
              label="Poverty Rate"
              value={formatPercent(data.poverty_pct)}
              benchmark={formatPercent(LA_COUNTY_BENCHMARK.poverty_pct)}
              compareValue={compareData ? formatPercent(compareData.poverty_pct) : undefined}
              isHigherBetter={false}
              primary={data.poverty_pct}
              secondary={compareData?.poverty_pct}
            />
            <MetricCard
              label="Median Income"
              value={formatCurrency(data.median_hh_income)}
              compareValue={compareData ? formatCurrency(compareData.median_hh_income) : undefined}
              isHigherBetter={true}
              primary={data.median_hh_income ?? 0}
              secondary={compareData?.median_hh_income ?? undefined}
            />
            <MetricCard
              label="No Internet"
              value={formatPercent(data.no_internet_pct)}
              benchmark={formatPercent(LA_COUNTY_BENCHMARK.no_internet_pct)}
              compareValue={compareData ? formatPercent(compareData.no_internet_pct) : undefined}
              isHigherBetter={false}
              primary={data.no_internet_pct}
              secondary={compareData?.no_internet_pct}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  benchmark?: string;
  compareValue?: string;
  isHigherBetter: boolean;
  primary: number;
  secondary?: number;
}

function MetricCard({ label, value, benchmark, compareValue, isHigherBetter, primary, secondary }: MetricCardProps) {
  let comparison: 'better' | 'worse' | 'equal' | undefined;
  if (secondary !== undefined) {
    if (isHigherBetter) {
      comparison = primary > secondary ? 'better' : primary < secondary ? 'worse' : 'equal';
    } else {
      comparison = primary < secondary ? 'better' : primary > secondary ? 'worse' : 'equal';
    }
  }

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      {benchmark && (
        <p className="text-xs text-muted-foreground">County: {benchmark}</p>
      )}
      {compareValue && (
        <div className="flex items-center gap-1 mt-1">
          <span
            className={`text-xs ${
              comparison === 'better'
                ? 'text-green-600'
                : comparison === 'worse'
                ? 'text-red-600'
                : 'text-muted-foreground'
            }`}
          >
            vs {compareValue}
          </span>
        </div>
      )}
    </div>
  );
}
