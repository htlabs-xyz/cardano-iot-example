export interface UserInfoRequest {
  /** The identity of person */
  user_id: string;

  /** The name of person */
  user_fullname: string;

  /** The date of birth */
  user_birthday: Date;

  /** The gender of person */
  user_gender: string;

  /** The country of person */
  user_country: string;
}

export interface UserVerifyRequest {
  user_id: string;
}
export interface UserVerifyResponse {
  user_fullname: string;
  user_birthday: Date;
  user_gender: string;
  user_country: string;
}