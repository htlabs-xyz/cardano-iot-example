
import { ApiResponse } from "@/types/response.type";
import http from "@/lib/http";
import { Device } from "../types/device.type";

const deviceApiRequest = {
    getList: () => http.get<ApiResponse<Device[]>>('/temperature-sensor/devices'),
};

export default deviceApiRequest;