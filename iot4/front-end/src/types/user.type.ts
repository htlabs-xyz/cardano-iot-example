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
  /** The identity of person */
  user_id: string;

  /** The name of person */
  user_fullname: string;
}
