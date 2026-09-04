export type OperationalRisk = 'NORMAL' | 'WATCH' | 'HIGH' | 'CRITICAL';
export type FeederTrend = 'up' | 'down' | 'stable';
export type AlertStatus = 'Open' | 'Acknowledged' | 'Resolved';

export interface HourlyDemandPoint {
  hour: string;
  hour_num: number;
  actual: number | null;
  forecast: number;
  previous_day: number;
  capacity: number;
  upper_bound: number;
  lower_bound: number;
}

export interface OverviewTelemetry {
  timestamp: string;
  system_status: string;
  system_frequency_hz: number;
  grid_capacity_mw: number;
  current_demand_mw: number;
  predicted_peak_mw: number;
  peak_time: string;
  capacity_utilization_pct: number;
  forecast_accuracy_pct: number;
  margin_to_capacity_mw: number;
  peak_risk: OperationalRisk;
  hourly_chart: HourlyDemandPoint[];
}

export interface SevenDayForecastRow {
  date: string;
  day_name: string;
  predicted_peak_mw: number;
  peak_time: string;
  avg_demand_mw: number;
  capacity_margin_mw: number;
  risk: OperationalRisk;
}

export interface ForecastResponse {
  area: string;
  horizon: '24h' | '7d';
  capacity_mw: number;
  current_peak_forecast_mw: number;
  upper_bound_mw: number;
  lower_bound_mw: number;
  curve_24h: Array<{
    timestamp: string;
    hour_num: number;
    actual: number | null;
    forecast: number;
    upper_bound: number;
    lower_bound: number;
    capacity: number;
  }>;
  seven_day_table: SevenDayForecastRow[];
  seven_day_curve: Array<{
    date: string;
    forecast_peak: number;
    forecast_avg: number;
    upper_bound: number;
    lower_bound: number;
    capacity: number;
  }>;
}

export interface ZoneTelemetry {
  id: 'North' | 'South' | 'East' | 'West' | 'Central';
  name: string;
  discom: string;
  demand_mw: number;
  forecast_mw: number;
  capacity_mw: number;
  load_pct: number;
  status: OperationalRisk;
  trend: FeederTrend;
  reactive_mvar: number;
  power_factor: number;
  key_substations: string[];
  summary: string;
}

export interface LiveGridTelemetry {
  system_frequency_hz: number;
  frequency_status: string;
  total_delhi_demand_mw: number;
  grid_capacity_mw: number;
  net_import_mw: number;
  internal_gen_mw: number;
  system_status: string;
  zones: ZoneTelemetry[];
}

export interface FeederTelemetry {
  id: string;
  name: string;
  area: string;
  discom: string;
  substation: string;
  current_load_mw: number;
  forecast_peak_mw: number;
  capacity_mw: number;
  utilization_pct: number;
  trend: FeederTrend;
  status: OperationalRisk;
  power_factor: number;
  voltage_kv: number;
  historical_peak_mw: number;
  capacity_margin_mw: number;
  recommendation: string;
  hourly_curve?: Array<{
    hour: string;
    demand_mw: number;
    capacity_mw: number;
  }>;
}

export interface WeatherTelemetry {
  telemetry: {
    source: string;
    latitude: number;
    longitude: number;
    temperature: number;
    humidity: number;
    feels_like: number;
    wind_speed: number;
    weather_code: number;
    weather_condition: string;
    expected_peak_temp: number;
    hourly_temps: number[];
    hourly_humidity: number[];
    hourly_time: string[];
    forecast_daily: Array<{
      day_offset: number;
      max_temp: number;
      min_temp: number;
      avg_humidity: number;
    }>;
  };
  temperature_c: number;
  expected_peak_temp_c: number;
  estimated_demand_impact_pct: number;
  temperature_variance_explained_pct: number;
  cooling_degree_sensitivity_mw_per_c: number;
  correlation_curve: Array<{
    temp_c: number;
    demand_mw: number;
    ac_load_mw: number;
  }>;
}

export interface AlertTelemetry {
  id: string;
  title: string;
  severity: OperationalRisk;
  area: string;
  timestamp: string;
  description: string;
  status: AlertStatus;
  recommended_action: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
}

export interface HistoricalTelemetry {
  time_range: '7d' | '30d' | '90d' | '1y';
  highest_recorded_demand_mw: number;
  highest_recorded_date: string;
  average_peak_mw: number;
  peak_growth_pct: string;
  average_temperature_c: number;
  most_frequent_peak_hour: string;
  daily_trend: Array<{
    date: string;
    full_date: string;
    peak_demand_mw: number;
    avg_demand_mw: number;
    temperature_c: number;
    cooling_demand_mw: number;
  }>;
  temp_scatter: Array<{
    temperature_c: number;
    demand_mw: number;
  }>;
  peak_hour_distribution: Array<{
    hour: string;
    pct: number;
  }>;
  yoy_comparison: Array<{
    month: string;
    year_2024: number;
    year_2025: number;
    year_2026: number;
  }>;
}

export interface ModelPerformanceTelemetry {
  model_name: string;
  algorithm: string;
  mae_mw: number;
  rmse_mw: number;
  mape_pct: number;
  r2_score: number;
  training_data_range: string;
  training_samples: number;
  features: string[];
  feature_importance: Array<{
    feature: string;
    importance_pct: number;
    category: string;
  }>;
  last_model_update: string;
  prediction_horizon: string;
  model_status: string;
  validation_strategy: string;
}
