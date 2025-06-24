import http from "@/lib/http";
import { ApiResponse } from "@/types/response.type";
import { UserInfoRequest, UserVerifyRequest } from "@/types/user.type";


const userIdentityApiRequest = {
    submitUserIdentityInfo: (body: UserInfoRequest) => http.post<ApiResponse<string>>(`/user-identity`, body),
    verifyUserInfo: (body: UserVerifyRequest) => http.post<ApiResponse<any>>(`/user-identity/verify`, body),
};

export default userIdentityApiRequest;