
export interface Temperature {
  temperature?: number;
  humidity?: number;
  time?: Date;
  tx_ref: string;
}
export interface TemperatureChartData extends Temperature {
  id: number;
  formattedDate: string;
  formattedTime: string;
  formattedTemperature: string;
  formattedHumidity: string;
}
