
import http from "@/lib/http";
import { ApiResponse, DeviceDetails } from "../types/response.type";

const productApiRequest = {
    getListProductByDevice: (id: number) => http.get<ApiResponse<DeviceDetails>>(`/products/device/${id}`),
};

export default productApiRequest;