export interface GeoArea {
  geo_id: string
  geo_type: "county" | "city" | "puma" | "zip"
  name: string
  population: number
  proficiency: {
    english_only: number
    english_only_pct: number
    bilingual: number
    bilingual_pct: number
    lep: number
    lep_pct: number
    total_pop_5plus: number
  }
  poverty: {
    universe: number
    band_1_124: number
    band_1_124_pct: number
    band_125_199: number
    band_125_199_pct: number
    band_200_399: number
    band_200_399_pct: number
    band_400plus: number
    band_400plus_pct: number
    below_poverty_pct: number
  }
  education: {
    universe: number
    under_9th: number
    under_9th_pct: number
    incomplete_hs: number
    incomplete_hs_pct: number
    hs_some_college: number
    hs_some_college_pct: number
    ba_higher: number
    ba_higher_pct: number
  }
  access: {
    no_internet: number
    no_internet_pct: number
    no_computer: number
    no_computer_pct: number
    snap_households: number
    snap_pct: number
    linguistically_isolated: number
    linguistically_isolated_pct: number
  }
  median_hh_income: number | null
  top_language: string
  top_language_lep: number
  languages: {
    name: string
    total_speakers: number
    lep_count: number
    lep_pct_of_area: number
  }[]
  lep_total: number
  lep_pct: number
  poverty_pct: number
  no_internet_pct: number
  snap_pct: number
}

export type GeoType = "county" | "city" | "puma" | "zip"

export const LA_COUNTY_BENCHMARK = {
  lep_pct: 23.4,
  poverty_pct: 17.9,
  no_internet_pct: 8.2,
  snap_pct: 14.1,
  linguistically_isolated_pct: 18.0,
}

export const CALIFORNIA_BENCHMARK = {
  lep_pct: 19.0,
  poverty_pct: 15.2,
  no_internet_pct: 7.8,
  snap_pct: 11.9,
  linguistically_isolated_pct: 14.0,
}

export const SAMPLE_AREA: GeoArea = {
  geo_id: "0603745",
  geo_type: "puma",
  name: "Southeast/East Vernon (LA City)",
  population: 118105,
  proficiency: {
    english_only: 17280,
    english_only_pct: 15.5,
    bilingual: 37116,
    bilingual_pct: 33.3,
    lep: 56962,
    lep_pct: 51.2,
    total_pop_5plus: 111358,
  },
  poverty: {
    universe: 117058,
    band_1_124: 39031,
    band_1_124_pct: 33.3,
    band_125_199: 27278,
    band_125_199_pct: 23.3,
    band_200_399: 3768,
    band_200_399_pct: 3.2,
    band_400plus: 1609,
    band_400plus_pct: 1.4,
    below_poverty_pct: 33.3,
  },
  education: {
    universe: 73296,
    under_9th: 27334,
    under_9th_pct: 37.3,
    incomplete_hs: 12154,
    incomplete_hs_pct: 16.6,
    hs_some_college: 28077,
    hs_some_college_pct: 38.3,
    ba_higher: 5731,
    ba_higher_pct: 7.8,
  },
  access: {
    no_internet: 3250,
    no_internet_pct: 11.2,
    no_computer: 655,
    no_computer_pct: 2.3,
    snap_households: 7743,
    snap_pct: 26.8,
    linguistically_isolated: 8568,
    linguistically_isolated_pct: 29.6,
  },
  median_hh_income: 56076,
  top_language: "Spanish",
  top_language_lep: 56100,
  languages: [
    {
      name: "Spanish",
      total_speakers: 92433,
      lep_count: 56100,
      lep_pct_of_area: 50.4,
    },
    {
      name: "Korean",
      total_speakers: 483,
      lep_count: 426,
      lep_pct_of_area: 0.4,
    },
    {
      name: "Other languages",
      total_speakers: 838,
      lep_count: 260,
      lep_pct_of_area: 0.2,
    },
    {
      name: "Chinese (Mandarin/Cantonese)",
      total_speakers: 150,
      lep_count: 80,
      lep_pct_of_area: 0.1,
    },
    {
      name: "Arabic",
      total_speakers: 22,
      lep_count: 20,
      lep_pct_of_area: 0.0,
    },
  ],
  lep_total: 56962,
  lep_pct: 51.2,
  poverty_pct: 33.3,
  no_internet_pct: 11.2,
  snap_pct: 26.8,
}
