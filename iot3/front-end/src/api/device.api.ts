

import http from "@/lib/http";
import { Device } from "../types/device.type";
import { ApiResponse } from "../types/response.type";

const deviceApiRequest = {
    getList: () => http.get<ApiResponse<Device[]>>('/devices'),
};

export default deviceApiRequest;