export type Pricing = {
  pvp_eur: number | null;
  offerly_price_eur: number | null;
  variable_cost_eur: number | null;
  commission_pct: number;
};

export type Simulation = {
  units_p10: number;
  units_p50: number;
  units_p90: number;
  profit_p10_eur: number;
  profit_p50_eur: number;
  profit_p90_eur: number;
  probability_profitable: number;
};

export type Campaign = {
  merchant_name: string | null;
  business_type: string | null;
  city: string | null;
  neighborhood: string | null;
  category: string | null;
  offer_name: string | null;
  title: string | null;
  description: string | null;
  fine_print: string[];
  pricing: Pricing;
  weekly_capacity: number | null;
  weekly_slots: string[];
  voucher_validity_days: number | null;
  stock: number | null;
  target_audience: string | null;
  goal: string | null;
  simulation: Simulation | null;
};

export type SseSnapshot = {
  status: string;
  current_agent: string | null;
  completed: string[];
  demo: boolean;
};

export type SseAgentEvent = {
  agent: string;
  completed: string[];
};

export type SseDone = {
  campaign: Campaign;
  summary: string;
  completed: string[];
};

export type SseError = {
  message: string;
  agent?: string;
};

export type LogLine = {
  stream: "stdout" | "stderr";
  line: string;
};
