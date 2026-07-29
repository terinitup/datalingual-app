'use client';

import { GeoArea } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DemographicsChartProps {
  data: GeoArea;
  compareData?: GeoArea;
}

const COLORS = [
  '#2E8B9A', '#F5B041', '#9B59B6', '#E57373', '#3498DB',
  '#1ABC9C', '#E67E22', '#E91E63', '#00BCD4', '#8BC34A',
  '#FF5722', '#607D8B', '#795548', '#FFC107', '#673AB7',
  '#4CAF50', '#F44336', '#2196F3', '#FF9800', '#009688',
  '#CDDC39', '#03A9F4', '#9C27B0', '#FFEB3B', '#FF5252',
  '#69F0AE', '#40C4FF', '#EA80FC', '#FFD740', '#FF6D00',
  '#B2FF59', '#18FFFF', '#E040FB', '#FFAB40', '#FF6E40',
  '#CCFF90', '#84FFFF', '#CE93D8', '#FFCC02', '#FF9E80',
  '#F8BBD0', '#B3E5FC', '#D1C4E9', '#DCEDC8', '#FFF9C4',
];

function safe(n: number | null | undefined): number {
  return n != null && !isNaN(n) ? n : 0;
}

export function DemographicsChart({ data, compareData }: DemographicsChartProps) {
  if (!data || !data.proficiency) {
    return null;
  }

  const proficiencyData = [
    {
      name: 'English Proficient',
      [data.name]: safe(data.proficiency.english_only_pct) + safe(data.proficiency.bilingual_pct),
      ...(compareData?.proficiency ? { [compareData.name]: safe(compareData.proficiency.english_only_pct) + safe(compareData.proficiency.bilingual_pct) } : {}),
    },
    {
      name: 'Limited English',
      [data.name]: safe(data.proficiency.lep_pct),
      ...(compareData?.proficiency ? { [compareData.name]: safe(compareData.proficiency.lep_pct) } : {}),
    },
  ];

  const allLanguages = (data.languages ?? [])
    .filter((lang) => safe(lang.lep_count) > 0)
    .sort((a, b) => safe(b.lep_count) - safe(a.lep_count));

  const languagePieData = allLanguages.map((lang) => ({
    name: lang.name,
    value: safe(lang.lep_count),
    pct: safe(lang.lep_pct_of_area),
  }));

  const totalLep = safe(data.lep_total);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Proficiency Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">Language Proficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={proficiencyData} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [value != null ? `${value.toFixed(1)}%` : 'N/A', '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey={data.name} fill="#2E8B9A" radius={[0, 4, 4, 0]} />
                  {compareData && (
                    <Bar dataKey={compareData.name} fill="#F5B041" radius={[0, 4, 4, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">Population with LEP by Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {languagePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languagePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {languagePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _: string, props: any) => [
                        `${new Intl.NumberFormat('en-US').format(value)} speakers (${safe(props.payload?.pct).toFixed(1)}%)`,
                        props.payload?.name,
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No language data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scrollable Language List */}
      {allLanguages.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">
            All Languages — {new Intl.NumberFormat('en-US').format(totalLep)} Speakers with LEP            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 overflow-y-auto pr-1">
              <div className="space-y-1">
                {allLanguages.map((lang, index) => {
                  const count = safe(lang.lep_count);
                  const pct = safe(lang.lep_pct_of_area);
                  const barWidth = totalLep > 0 ? (count / totalLep) * 100 : 0;
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div
                      key={lang.name}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: color + '18' }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium text-foreground w-48 flex-shrink-0 truncate">
                        {lang.name}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(barWidth, 100)}%`, backgroundColor: color }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-28 text-right flex-shrink-0">
                        {new Intl.NumberFormat('en-US').format(count)} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}