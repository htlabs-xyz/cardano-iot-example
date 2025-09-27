import http from "@/lib/http";
import { ApiResponse } from "@/types/response.type";
import { Temperature } from "../types/temperature.type";

const temperatureApiRequest = {
  getAllTemperature: () =>
    http.get<ApiResponse<Temperature[]>>(`/temperature-sensor`),
};

export default temperatureApiRequest;
