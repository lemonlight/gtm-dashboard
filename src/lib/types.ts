export interface TimeRange {
  label: string;
  days: number | null; // null = all time
  start: string; // YYYYMMDD for Amplitude, ISO for MongoDB
  end: string;
}

export interface CohortConfig {
  label: string;
  orgIds: string[];
  amplitudeCohortId: string | null;
  isExclusion: boolean;
}

export interface CohortState {
  [key: string]: boolean;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface SeriesDataPoint {
  date: string;
  [seriesName: string]: string | number;
}

export interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
}

export interface ChartSectionStatus {
  status: "ok" | "error" | "loading";
  error?: string;
}

export interface AccountGrowthData extends ChartSectionStatus {
  series: DataPoint[];
  totalOrgs: number;
}

export interface MRRData extends ChartSectionStatus {
  series: DataPoint[];
  currentMRR: number;
}

export interface SeatsData extends ChartSectionStatus {
  summary: {
    totalOrgs: number;
    avgSeatsPerOrg: number;
    totalPaidSeats: number;
    totalUnpaidSeats: number;
  };
  series: SeriesDataPoint[];
}

export interface RetentionData extends ChartSectionStatus {
  overallRate: number;
  funnel: FunnelStep[];
  series: DataPoint[];
  orgsInWindow: number;
  orgsOnTrack: number;
  orgsFailed: number;
  avgTimeToSecondProject: number | null;
}

export interface ActivationData extends ChartSectionStatus {
  rate: number;
  series: DataPoint[];
}

export interface OrgRow {
  orgId: string;
  name: string;
  createdAt: string;
  projectCount: number;
  paidSeats: number;
  unpaidSeats: number;
  hitD30: boolean | null;
  hitD30Ever: boolean | null;
}

export interface OrgTableData extends ChartSectionStatus {
  rows: OrgRow[];
  total: number;
}

export interface DashboardData {
  timestamp: string | null;
  accountGrowth: AccountGrowthData;
  mrr: MRRData;
  seats: SeatsData;
  retention: RetentionData;
  activation: ActivationData;
  orgTable: OrgTableData;
}
