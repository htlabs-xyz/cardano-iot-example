
import http from "@/lib/http";
import { LoginRequest, LoginResponse, RegisterNewLockRequest } from "@/types/auth.type";
import { ApiResponse, SubmitTxRequest, SubmitTxResponse } from "@/types/response.type";
import { AuthorizeRequest, LockInfoRequest, LockRequest, LockStatusResponse } from "../types/lock.type";

const lockApiRequest = {
    login: (loginRequest: LoginRequest) => http.post<ApiResponse<LoginResponse>>(`/lock-device/login`, loginRequest),
    register: (registerRequest: RegisterNewLockRequest) => http.post<ApiResponse<string>>(`/lock-device/register`, registerRequest),
    requestUpdateStatusDevice: (body: LockRequest) => http.post<ApiResponse<string>>('/lock-device/update-status', body),
    requestAuthorize: (body: AuthorizeRequest) => http.post<ApiResponse<string>>('/lock-device/authorize', body),
    submitTransaction: (body: SubmitTxRequest) => http.post<ApiResponse<SubmitTxResponse>>('/lock-device/submit-transaction', body),
    getAllLockHistory: (query: LockInfoRequest) => http.get<ApiResponse<LockStatusResponse[]>>(`/lock-device/history?lock_name=${query.lock_name}&owner_addr=${query.owner_addr}`),
    getLockStatus: (query: LockInfoRequest) => http.get<ApiResponse<LockStatusResponse>>(`/lock-device/lock-status?lock_name=${query.lock_name}&owner_addr=${query.owner_addr}`),
};

export default lockApiRequest;