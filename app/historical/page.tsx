'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';

const HistoricalMapView = dynamic(() => import('@/components/historical-map-view').then(m => m.HistoricalMapView), { ssr: false, loading: () => <div className="h-full w-full rounded-lg bg-muted animate-pulse" /> });

const YEARS = [1950, 1960, 1970, 1980, 1990, 2000, 2010];

// Poverty data (poverty.json) uses census income years, offset from the decades.
const POVERTY_YEARS = [1959, 1969, 1979, 1989, 1999, 2010, 2020];

// Map-view decade -> poverty income year (1950 has no poverty data).
const DECADE_TO_POVERTY_YEAR: Record<number, number> = { 1960: 1959, 1970: 1969, 1980: 1979, 1990: 1989, 2000: 1999, 2010: 2010 };

// Categories and metric names mirror the USC LA County Demographic Data
// Project source sheets exactly, in sheet order.
const ALL_METRICS = [
  { key: 'population', label: 'Population total', format: 'number', category: 'Population' },
  { key: 'white_pct', label: 'White non-Hispanic', format: 'pct', category: 'Race/ethnicity/nativity' },
  { key: 'black_pct', label: 'Black', format: 'pct', category: 'Race/ethnicity/nativity' },
  { key: 'hispanic_pct', label: 'Hispanic', format: 'pct', category: 'Race/ethnicity/nativity' },
  { key: 'asian_pct', label: 'Asian (Chinese, Japanese)', format: 'pct', category: 'Race/ethnicity/nativity' },
  { key: 'native_born_pct', label: 'Native born', format: 'pct', category: 'Race/ethnicity/nativity' },
  { key: 'foreign_born_pct', label: 'Foreign born', format: 'pct', category: 'Race/ethnicity/nativity' },
  { key: 'born_europe_canada_pct', label: 'Birthplace: Europe-Canada', format: 'pct', category: 'Place of birth of foreign-born' },
  { key: 'born_ussr_pct', label: 'Birthplace: USSR', format: 'pct', category: 'Place of birth of foreign-born' },
  { key: 'born_central_america_pct', label: 'Birthplace: Central America', format: 'pct', category: 'Place of birth of foreign-born' },
  { key: 'born_mexico_pct', label: 'Birthplace: Mexico', format: 'pct', category: 'Place of birth of foreign-born' },
  { key: 'born_middle_east_pct', label: 'Birthplace: Middle East', format: 'pct', category: 'Place of birth of foreign-born' },
  { key: 'born_asia_pct', label: 'Birthplace: Asia', format: 'pct', category: 'Place of birth of foreign-born' },
  { key: 'median_hh_income', label: 'Median household income (in dollars)', format: 'currency', category: 'Class/occupations' },
  { key: 'median_family_income', label: 'Median family income (in dollars)', format: 'currency', category: 'Class/occupations' },
  { key: 'occ_white_collar_pct', label: 'Occupation: White collar', format: 'pct', category: 'Class/occupations' },
  { key: 'occ_clerical_sales_pct', label: 'Occupation: Clerical & sales', format: 'pct', category: 'Class/occupations' },
  { key: 'occ_blue_collar_pct', label: 'Occupation: Blue collar', format: 'pct', category: 'Class/occupations' },
  { key: 'occ_service_pct', label: 'Occupation: Service', format: 'pct', category: 'Class/occupations' },
  { key: 'occ_protective_service_pct', label: 'Occupation: Protective service', format: 'pct', category: 'Class/occupations' },
  { key: 'occ_domestics_pct', label: 'Occupation: Domestics', format: 'pct', category: 'Class/occupations' },
  { key: 'occ_other_service_pct', label: 'Occupation: Other service', format: 'pct', category: 'Class/occupations' },
  { key: 'females_labor_force_pct', label: 'Females in labor force', format: 'pct', category: 'Class/occupations' },
  { key: 'wives_mothers_labor_force', label: 'Wives/mothers in labor force', format: 'number', category: 'Class/occupations' },
  { key: 'wives_mothers_lf_adult_women_pct', label: 'Wives/mothers in labor force (as % of all adult women)', format: 'pct', category: 'Class/occupations' },
  { key: 'wives_mothers_lf_pct', label: 'Wives/mothers in labor force (as % of all wives/mothers)', format: 'pct', category: 'Class/occupations' },
  { key: 'stay_home_wives_mothers_pct', label: 'Stay at home wives/mothers (as % of all wives/mothers)', format: 'pct', category: 'Class/occupations' },
  { key: 'edu_no_hs_pct', label: 'Did not complete high school', format: 'pct', category: 'Education' },
  { key: 'edu_hs_only_pct', label: 'Completed high school only', format: 'pct', category: 'Education' },
  { key: 'edu_some_college_pct', label: 'Some college', format: 'pct', category: 'Education' },
  { key: 'edu_college_pct', label: 'Completed college', format: 'pct', category: 'Education' },
  { key: 'median_school_years', label: 'Median school years completed', format: 'number', category: 'Education' },
  { key: 'children_private_school_pct', label: 'Children in elementary private school', format: 'pct', category: 'Education' },
  { key: 'median_age', label: 'Median age', format: 'number', category: 'Age of residents' },
  { key: 'age_0_4_pct', label: 'Persons age 0-4', format: 'pct', category: 'Age of residents' },
  { key: 'age_5_19_pct', label: 'Persons age 5-19', format: 'pct', category: 'Age of residents' },
  { key: 'age_20_64_pct', label: 'Persons age 20-64', format: 'pct', category: 'Age of residents' },
  { key: 'age_65plus_pct', label: 'Persons age 65 and over', format: 'pct', category: 'Age of residents' },
  { key: 'adult_population', label: 'Total adult population', format: 'number', category: 'Family status' },
  { key: 'family_single_pct', label: 'Single', format: 'pct', category: 'Family status' },
  { key: 'family_married_pct', label: 'Married', format: 'pct', category: 'Family status' },
  { key: 'family_widowed_pct', label: 'Widowed', format: 'pct', category: 'Family status' },
  { key: 'family_divorced_pct', label: 'Divorced', format: 'pct', category: 'Family status' },
  { key: 'persons_per_household', label: '# persons per household', format: 'number', category: 'Family status' },
  { key: 'housing_units', label: 'Total housing units', format: 'number', category: 'Housing' },
  { key: 'housing_owner_pct', label: 'Owner-occupied housing units', format: 'pct', category: 'Housing' },
  { key: 'housing_renter_pct', label: 'Rented housing units', format: 'pct', category: 'Housing' },
  { key: 'housing_white_owner_pct', label: 'White owner-occupied housing units', format: 'pct', category: 'Housing' },
  { key: 'housing_nonwhite_owner_pct', label: 'Non-white owner-occupied housing units', format: 'pct', category: 'Housing' },
  { key: 'housing_white_renter_pct', label: 'White rented housing units', format: 'pct', category: 'Housing' },
  { key: 'housing_nonwhite_renter_pct', label: 'Non-white rented housing units', format: 'pct', category: 'Housing' },
  { key: 'median_house_value', label: 'Median house value (in dollars)', format: 'currency', category: 'Housing' },
  { key: 'median_rent', label: 'Median contract rent (in dollars)', format: 'currency', category: 'Housing' },
  { key: 'housing_single_family_pct', label: 'Single-family detached housing units', format: 'pct', category: 'Housing' },
  { key: 'housing_multi_2_4_pct', label: 'Multi units: 2-4 units', format: 'pct', category: 'Housing' },
  { key: 'housing_multi_5plus_pct', label: 'Multi units: 5+ units', format: 'pct', category: 'Housing' },
];

// Poverty metrics come from poverty.json (1959-2020), not historical.json.
// Labels mirror the source sheet's column headers exactly. (In 1959 the source
// measures 'income <$3000' rather than the poverty level — noted in chart footnotes.)
const POVERTY_METRICS = [
  { key: 'poverty_pct', label: '% income less than poverty level', format: 'pct', category: 'Poverty' },
  { key: 'poor_families', label: '# families with income less than poverty level', format: 'number', category: 'Poverty' },
  { key: 'all_families', label: 'All families', format: 'number', category: 'Poverty' },
];

const GRAPH_METRICS = ALL_METRICS;

// Data Graphs view shows the same categories as the map.
const GRAPH_CATEGORIES = ['Population', 'Race/ethnicity/nativity', 'Place of birth of foreign-born', 'Class/occupations', 'Education', 'Age of residents', 'Family status', 'Housing'];

// Compare view adds Poverty (its own dataset with its own years).
const COMPARE_CATEGORIES = [...GRAPH_CATEGORIES, 'Poverty'];

// Categories whose metrics measure different things get split into toggleable
// sub-charts instead of one crowded (or mixed-unit) chart.
const SUBCHARTS: Record<string, { id: string; label: string; keys: string[] }[]> = {
  'Race/ethnicity/nativity': [
    { id: 'race', label: 'Race/Ethnicity', keys: ['white_pct', 'black_pct', 'hispanic_pct', 'asian_pct'] },
    { id: 'nativity', label: 'Nativity', keys: ['native_born_pct', 'foreign_born_pct'] },
  ],
  'Class/occupations': [
    { id: 'income', label: 'Income', keys: ['median_hh_income', 'median_family_income'] },
    { id: 'occupation', label: 'Occupation', keys: ['occ_white_collar_pct', 'occ_clerical_sales_pct', 'occ_blue_collar_pct', 'occ_service_pct'] },
    { id: 'service_detail', label: 'Service Detail', keys: ['occ_protective_service_pct', 'occ_domestics_pct', 'occ_other_service_pct'] },
    { id: 'women', label: 'Women in Workforce', keys: ['females_labor_force_pct', 'wives_mothers_lf_adult_women_pct', 'wives_mothers_lf_pct', 'stay_home_wives_mothers_pct', 'wives_mothers_labor_force'] },
  ],
  Education: [
    { id: 'attainment', label: 'Attainment', keys: ['edu_no_hs_pct', 'edu_hs_only_pct', 'edu_some_college_pct', 'edu_college_pct'] },
    { id: 'school_years', label: 'Median School Years', keys: ['median_school_years'] },
    { id: 'private_school', label: 'Private School', keys: ['children_private_school_pct'] },
  ],
  'Age of residents': [
    { id: 'distribution', label: 'Age Distribution', keys: ['age_0_4_pct', 'age_5_19_pct', 'age_20_64_pct', 'age_65plus_pct'] },
    { id: 'median', label: 'Median Age', keys: ['median_age'] },
  ],
  'Family status': [
    { id: 'marital', label: 'Marital Status', keys: ['family_single_pct', 'family_married_pct', 'family_widowed_pct', 'family_divorced_pct'] },
    { id: 'adults', label: 'Adult Population', keys: ['adult_population'] },
    { id: 'hh_size', label: 'Household Size', keys: ['persons_per_household'] },
  ],
  Housing: [
    { id: 'ownership', label: 'Ownership', keys: ['housing_owner_pct', 'housing_renter_pct'] },
    { id: 'ownership_race', label: 'Ownership by Race', keys: ['housing_white_owner_pct', 'housing_nonwhite_owner_pct', 'housing_white_renter_pct', 'housing_nonwhite_renter_pct'] },
    { id: 'types', label: 'Housing Types', keys: ['housing_single_family_pct', 'housing_multi_2_4_pct', 'housing_multi_5plus_pct'] },
    { id: 'units', label: 'Total Units', keys: ['housing_units'] },
    { id: 'value', label: 'House Value', keys: ['median_house_value'] },
    { id: 'rent', label: 'Rent', keys: ['median_rent'] },
  ],
};

const CATEGORIES = GRAPH_CATEGORIES;
const COLORS = ['#2E8B9A', '#F5B041', '#9B59B6', '#E57373', '#3498DB', '#1ABC9C', '#E67E22', '#FF5722', '#8BC34A'];

// Custom bold dropdown chevron (native select arrows can't be styled).
const SELECT_ARROW_STYLE: React.CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.6rem center',
  backgroundSize: '0.85em',
  paddingRight: '2rem',
};

function formatValue(val: number | undefined, format: string): string {
  if (val == null || isNaN(val)) return 'N/A';
  if (format === 'currency') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(val) ? 0 : 2, maximumFractionDigits: Number.isInteger(val) ? 0 : 2 }).format(val);
  if (format === 'pct') return `${val.toFixed(2)}%`;
  return new Intl.NumberFormat('en-US').format(val);
}

interface CityData {
  name: string;
  years: Record<string, Record<string, number>>;
}

// poverty.json city names come from a different source sheet, so match loosely
// (e.g. "Los Angeles" vs "Los Angeles City").
function normalizeName(n: string): string {
  return n.toLowerCase().replace(/[^a-z]/g, '');
}

export default function HistoricalPage() {
  const [data, setData] = useState<CityData[]>([]);
  const [county, setCounty] = useState<CityData | null>(null);
  const [povertyData, setPovertyData] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Burbank');
  const [selectedYear, setSelectedYear] = useState<number>(2010);
  const [selectedPovertyYear, setSelectedPovertyYear] = useState<number>(2020);
  const [selectedMetric, setSelectedMetric] = useState<string>('hispanic_pct');
  const [selectedCategory, setSelectedCategory] = useState<string>('Race/ethnicity/nativity');
  const [viewMode, setViewMode] = useState<'map' | 'graphs' | 'compare'>('map');
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedSubcharts, setSelectedSubcharts] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch('/data/historical.json').then(r => r.json()),
      fetch('/data/historical_county.json').then(r => r.json()).catch(() => null),
      fetch('/data/poverty.json').then(r => r.json()).catch(() => []),
    ])
      .then(([d, countyRec, pov]: [CityData[], CityData | null, CityData[]]) => {
        const cities = d.filter(c => c.name !== 'LA County');
        setData(cities);
        setCounty(countyRec);
        setPovertyData(pov);
      })
      .catch(console.error);
  }, []);

  const city = county && selectedCity === county.name ? county : data.find(d => d.name === selectedCity);
  const currentMetric = [...ALL_METRICS, ...POVERTY_METRICS].find(m => m.key === selectedMetric);
  const categoryMetrics = selectedCategory === 'Poverty' ? POVERTY_METRICS : ALL_METRICS.filter(m => m.category === selectedCategory);

  const findPoverty = (name: string | undefined) => {
    if (!name) return undefined;
    const key = normalizeName(name);
    return povertyData.find(p => {
      const pk = normalizeName(p.name);
      return pk === key || (pk === 'losangelescity' && key === 'losangeles') || (key === 'losangelescity' && pk === 'losangeles');
    });
  };
  const povertyCounty = povertyData.find(p => p.name === 'LA County');
  const povertyCity = findPoverty(selectedCity);

  const compareData = selectedCategory === 'Poverty'
    ? povertyData
        .filter(p => p.name !== 'LA County')
        .map(c => ({ name: c.name, value: c.years[String(selectedPovertyYear)]?.[selectedMetric] }))
        .filter(d => d.value != null)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    : data
        .map(c => ({ name: c.name, value: c.years[String(selectedYear)]?.[selectedMetric] }))
        .filter(d => d.value != null)
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  return (
    <div className="min-h-screen bg-background">

      {showWelcome && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl shadow-2xl border border-border max-w-md w-full p-8 z-10">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Los Angeles County Demographic Data Project 1950-2010</h2>
            <p className="text-sm text-muted-foreground italic mb-6">USC Digital Library</p>
            <div className="space-y-3 text-sm text-foreground">
            <p>
    This section displays data from the Los Angeles County Demographic Data Project. The description below is excerpted from the USC Digital Library.
  </p>
  <p>
    The Los Angeles County Demographic Data Project preserves and makes accessible a dataset tracing social changes in the City of Los Angeles, L.A. County, and 86 municipalities between 1950 and 2010. The Los Angeles County demographic dataset includes over 90 discrete data files and represents the culmination of more than a decade of work by historian Becky Nicolaides and her team while completing research for her book {' '}
    <a href="https://global.oup.com/us/companion.websites/9780197578308/" target="_blank" rel="noreferrer" className="underline hover:text-[#2E8B9A]">
      The New Suburbia: How Diversity Remade Suburban Life in Los Angeles After 1945 (Oxford, 2024)
    </a>. Nicolaides’ research for The New Suburbia was supported by grants from NEH, the American Council of Learned Societies the John Randolph Haynes & Dora Haynes Foundation, and other organizations. The dataset traces many facets of demographic change in Los Angeles and 86 nearby municipalities along with poverty rates and voter registration data.
  </p>
  <div className="pt-3 border-t border-border">
    <p className="text-xs font-semibold text-foreground mb-1">Data Citation</p>
    <p className="text-xs text-muted-foreground">
      Nicolaides, Becky M. et al. <em>Los Angeles County Demographic Data Project 1950–2010.</em> USC Libraries Digital Collections.{' '}
      <a href="https://doi.org/10.25549/lademo-ouc1sto1757543" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
        doi.org/10.25549/lademo-ouc1sto1757543
      </a>
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

      <Header />

      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Los Angeles County Demographic Data Project 1950-2010</h1>
        <p className="text-sm text-muted-foreground mt-1">USC Digital Library</p>
      </div>

      <div className="border-b border-border bg-card px-6 py-3 flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['map', 'graphs', 'compare'] as const).map(mode => (
            <button key={mode} onClick={() => { setViewMode(mode); if (mode === 'map' && county && selectedCity === county.name) setSelectedCity('Burbank'); }}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${viewMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
              {mode === 'map' ? 'Map' : mode === 'graphs' ? 'Data Graphs' : 'Compare Cities'}
            </button>
          ))}
        </div>

        {viewMode !== 'graphs' && !(viewMode === 'compare' && selectedCategory === 'Poverty') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground font-medium">Year:</span>
            {YEARS.map(y => (
              <button key={y} onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedYear === y ? 'bg-[#2E8B9A] text-white' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                {y}
              </button>
            ))}
          </div>
        )}

        {viewMode === 'compare' && selectedCategory === 'Poverty' && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground font-medium">Year:</span>
            {POVERTY_YEARS.map(y => (
              <button key={y} onClick={() => setSelectedPovertyYear(y)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedPovertyYear === y ? 'bg-[#2E8B9A] text-white' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                {y}
              </button>
            ))}
          </div>
        )}

        {viewMode === 'compare' && (
          <div className="flex items-center gap-2 flex-wrap">
            {COMPARE_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => { setSelectedCategory(cat); const first = cat === 'Poverty' ? POVERTY_METRICS[0] : ALL_METRICS.find(m => m.category === cat); if (first) setSelectedMetric(first.key); }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'map' && (
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-200px)]">
          <div className="lg:flex-[3] p-4 h-[45vh] min-h-[300px] lg:h-full">
            <HistoricalMapView
              data={data}
              selectedYear={selectedYear}
              selectedMetric="population"
              metricLabel="Population"
              metricFormat="number"
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
            />
          </div>
          <div className="lg:w-96 lg:flex-none border-t lg:border-t-0 lg:border-l border-border lg:overflow-y-auto">
            {city ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={SELECT_ARROW_STYLE}
                    className="font-serif text-lg font-bold text-foreground bg-background border border-border rounded-lg px-2 py-1 flex-1 min-w-0">
                    {data.filter(c => c.name !== 'LA County').map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <span className="text-sm text-[#2E8B9A] font-medium shrink-0">{selectedYear}</span>
                </div>
                {CATEGORIES.map(cat => {
                  const metrics = ALL_METRICS.filter(m => m.category === cat);
                  const hasData = metrics.some(m => city.years[String(selectedYear)]?.[m.key] != null);
                  if (!hasData) return null;
                  return (
                    <div key={cat}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 bg-muted/60 px-2 py-1 rounded">{cat}</h3>
                      <div className="space-y-1.5">
                        {metrics.map(m => {
                          const val = city.years[String(selectedYear)]?.[m.key];
                          if (val == null) return null;
                          return (
                            <div key={m.key} className="flex justify-between items-center text-sm py-1 border-b border-border/30">
                              <span className="text-muted-foreground">{m.label}</span>
                              <span className="font-medium text-foreground">{formatValue(val, m.format)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {(() => {
                  const povYear = DECADE_TO_POVERTY_YEAR[selectedYear];
                  const pv = povYear != null ? povertyCity?.years[String(povYear)] : undefined;
                  if (!pv) return null;
                  return (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 bg-muted/60 px-2 py-1 rounded">Poverty ({povYear} income)</h3>
                      <div className="space-y-1.5">
                        {POVERTY_METRICS.map(m => {
                          const val = pv[m.key];
                          if (val == null) return null;
                          return (
                            <div key={m.key} className="flex justify-between items-center text-sm py-1 border-b border-border/30">
                              <span className="text-muted-foreground">{m.label}</span>
                              <span className="font-medium text-foreground">{formatValue(val, m.format)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>Click a city on the map to view data</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'graphs' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">City:</span>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={SELECT_ARROW_STYLE}
              className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground">
              {county && <option value={county.name}>{county.name}</option>}
              {data.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {GRAPH_CATEGORIES.map(cat => {
            const allCatMetrics = GRAPH_METRICS.filter(m => m.category === cat);
            const subcharts = SUBCHARTS[cat]?.filter(sc =>
              sc.keys.some(k => YEARS.some(y => city?.years[String(y)]?.[k] != null))
            );
            const activeSubchart = subcharts?.length
              ? (subcharts.find(sc => sc.id === selectedSubcharts[cat]) ?? subcharts[0])
              : null;
            const metrics = activeSubchart
              ? activeSubchart.keys.map(k => allCatMetrics.find(m => m.key === k)).filter((m): m is typeof allCatMetrics[number] => m != null)
              : allCatMetrics;
            const trendData = YEARS.map(year => {
              const yearData = city?.years[String(year)] ?? {};
              const point: Record<string, number | string> = { year: String(year) };
              metrics.forEach(m => { if (yearData[m.key] != null) point[m.key] = yearData[m.key]; });
              return point;
            });
            const hasData = allCatMetrics.some(m => YEARS.some(y => city?.years[String(y)]?.[m.key] != null));
            if (!hasData) return null;

            // One y-axis per unit type (pct / currency / number) so mixed-unit
            // categories like Housing don't squash small-scale lines to zero.
            const formats = Array.from(new Set(metrics.map(m => m.format)));
            const axisIdForFormat = (fmt: string) => (formats.indexOf(fmt) === 0 ? 'left' : 'right');
            const tickFormatterFor = (fmt: string) => (v: number) =>
              fmt === 'currency' ? `$${(v / 1000).toFixed(0)}k` :
              fmt === 'pct' ? `${v}%` :
              new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v);

            return (
              <Card key={cat}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base font-sans">
                      {cat}{activeSubchart ? `: ${activeSubchart.label}` : ''} — {selectedCity} 1950–2010
                    </CardTitle>
                    {subcharts && subcharts.length > 1 && (
                      <div className="flex flex-wrap gap-1.5">
                        {subcharts.map(sc => (
                          <button key={sc.id}
                            onClick={() => setSelectedSubcharts(prev => ({ ...prev, [cat]: sc.id }))}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${activeSubchart?.id === sc.id ? 'bg-[#2E8B9A] text-white' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                            {sc.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ left: 10, right: 20, top: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 13, fontWeight: 600 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={tickFormatterFor(formats[0])} />
                        {formats.length > 1 && (
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={tickFormatterFor(formats[1])} />
                        )}
                        <Tooltip formatter={(value: number, name: string) => {
                          const m = GRAPH_METRICS.find(x => x.key === name);
                          return [formatValue(value, m?.format ?? 'number'), m?.label ?? name];
                        }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {metrics.map((m, i) => (
                          <Line key={m.key} yAxisId={axisIdForFormat(m.format)} type="monotone" dataKey={m.key} name={m.label}
                          stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {povertyCity && (() => {
            const trendData = POVERTY_YEARS.map(year => {
              const yearData = povertyCity.years[String(year)] ?? {};
              const point: Record<string, number | string> = { year: String(year) };
              if (yearData.poverty_pct != null) point.poverty_pct = yearData.poverty_pct;
              return point;
            });
            return (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-sans">
                    Poverty — {selectedCity} 1959–2020
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ left: 10, right: 20, top: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 13, fontWeight: 600 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                        <Tooltip formatter={(value: number) => [formatValue(value, 'pct'), '% income less than poverty level']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="poverty_pct" name="% income less than poverty level" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    1959 counts families with income under $3,000 (the era&apos;s approximate poverty threshold), not the modern federal poverty measure.
                  </p>
                </CardContent>
              </Card>
            );
          })()}

          <p className="text-xs text-muted-foreground text-center">
            Source: Los Angeles County Demographic Data Project 1950–2010, USC Libraries Digital Collections
          </p>
        </div>
      )}

      {viewMode === 'compare' && (
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {categoryMetrics.map(m => (
              <button key={m.key} onClick={() => setSelectedMetric(m.key)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedMetric === m.key ? 'bg-[#2E8B9A] text-white' : 'border border-border text-muted-foreground hover:bg-muted'}`}>
                {m.label}
              </button>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-sans">{currentMetric?.label} — All Cities, {selectedCategory === 'Poverty' ? selectedPovertyYear : selectedYear}</CardTitle>
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
          {selectedCategory === 'Poverty' && selectedPovertyYear === 1959 && (
            <p className="text-xs text-muted-foreground text-center">
              1959 counts families with income under $3,000 (the era&apos;s approximate poverty threshold), not the modern federal poverty measure.
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Source: Los Angeles County Demographic Data Project 1950–2010, USC Libraries Digital Collections
          </p>
        </div>
      )}
    </div>
  );
}
