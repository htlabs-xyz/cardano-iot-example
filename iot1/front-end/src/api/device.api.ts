
import { ApiResponse } from "@/data/type/response.type";
import http from "@/lib/http";
import { Device } from "../data/type/device.type";

const deviceApiRequest = {
    getList: () => http.get<ApiResponse<Device[]>>('/temperature-sensor/devices'),
};

export default deviceApiRequest;