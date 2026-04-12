'use client';

import { GeographyData } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/data';
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
  data: GeographyData;
  compareData?: GeographyData;
}

export function EconomicsChart({ data, compareData }: EconomicsChartProps) {
  const incomeData = [
    {
      name: 'Median Household',
      [data.name]: data.economics.medianHouseholdIncome,
      ...(compareData ? { [compareData.name]: compareData.economics.medianHouseholdIncome } : {}),
    },
    {
      name: 'Per Capita',
      [data.name]: data.economics.perCapitaIncome,
      ...(compareData ? { [compareData.name]: compareData.economics.perCapitaIncome } : {}),
    },
  ];

  const radarData = [
    {
      metric: 'Employment',
      [data.name]: 100 - data.economics.unemploymentRate,
      ...(compareData ? { [compareData.name]: 100 - compareData.economics.unemploymentRate } : {}),
      fullMark: 100,
    },
    {
      metric: 'Low Poverty',
      [data.name]: 100 - data.economics.povertyRate,
      ...(compareData ? { [compareData.name]: 100 - compareData.economics.povertyRate } : {}),
      fullMark: 100,
    },
    {
      metric: 'Education',
      [data.name]: data.education.bachelorsOrHigher,
      ...(compareData ? { [compareData.name]: compareData.education.bachelorsOrHigher } : {}),
      fullMark: 100,
    },
    {
      metric: 'Health Coverage',
      [data.name]: data.health.withHealthInsurance,
      ...(compareData ? { [compareData.name]: compareData.health.withHealthInsurance } : {}),
      fullMark: 100,
    },
    {
      metric: 'Home Ownership',
      [data.name]: data.housing.ownerOccupiedPercent,
      ...(compareData ? { [compareData.name]: compareData.housing.ownerOccupiedPercent } : {}),
      fullMark: 100,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans">Income Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '']}
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
          <CardTitle className="text-base font-sans">Key Economic Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Poverty Rate"
              value={formatPercent(data.economics.povertyRate)}
              compareValue={compareData ? formatPercent(compareData.economics.povertyRate) : undefined}
              isHigherBetter={false}
              primary={data.economics.povertyRate}
              secondary={compareData?.economics.povertyRate}
            />
            <MetricCard
              label="Unemployment"
              value={formatPercent(data.economics.unemploymentRate)}
              compareValue={compareData ? formatPercent(compareData.economics.unemploymentRate) : undefined}
              isHigherBetter={false}
              primary={data.economics.unemploymentRate}
              secondary={compareData?.economics.unemploymentRate}
            />
            <MetricCard
              label="Median Income"
              value={formatCurrency(data.economics.medianHouseholdIncome)}
              compareValue={compareData ? formatCurrency(compareData.economics.medianHouseholdIncome) : undefined}
              isHigherBetter={true}
              primary={data.economics.medianHouseholdIncome}
              secondary={compareData?.economics.medianHouseholdIncome}
            />
            <MetricCard
              label="Health Coverage"
              value={formatPercent(data.health.withHealthInsurance)}
              compareValue={compareData ? formatPercent(compareData.health.withHealthInsurance) : undefined}
              isHigherBetter={true}
              primary={data.health.withHealthInsurance}
              secondary={compareData?.health.withHealthInsurance}
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
  compareValue?: string;
  isHigherBetter: boolean;
  primary: number;
  secondary?: number;
}

function MetricCard({ label, value, compareValue, isHigherBetter, primary, secondary }: MetricCardProps) {
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
