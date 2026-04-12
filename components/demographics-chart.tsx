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
  Legend,
} from 'recharts';

interface DemographicsChartProps {
  data: GeoArea;
  compareData?: GeoArea;
}

const COLORS = ['#2E8B9A', '#6BB8CC', '#F5B041', '#E57373', '#9B59B6', '#3498DB', '#1ABC9C'];

export function DemographicsChart({ data, compareData }: DemographicsChartProps) {
  if (!data || !data.proficiency) {
    return null;
  }

  const proficiencyData = [
    {
      name: 'English Only',
      [data.name]: data.proficiency.english_only_pct,
      ...(compareData?.proficiency ? { [compareData.name]: compareData.proficiency.english_only_pct } : {}),
    },
    {
      name: 'Bilingual',
      [data.name]: data.proficiency.bilingual_pct,
      ...(compareData?.proficiency ? { [compareData.name]: compareData.proficiency.bilingual_pct } : {}),
    },
    {
      name: 'Limited English',
      [data.name]: data.proficiency.lep_pct,
      ...(compareData?.proficiency ? { [compareData.name]: compareData.proficiency.lep_pct } : {}),
    },
  ];

  const languagePieData = data.languages
    ?.filter((lang) => lang.lep_pct_of_area > 0.1)
    .slice(0, 7)
    .map((lang) => ({
      name: lang.name,
      value: lang.lep_count,
    })) ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans">LEP Population by Language</CardTitle>
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
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {languagePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [new Intl.NumberFormat('en-US').format(value), 'LEP Speakers']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: 11 }}
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
  );
}
