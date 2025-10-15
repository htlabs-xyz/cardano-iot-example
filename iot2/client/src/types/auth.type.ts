import { LockStatus } from "./lock.type";

export enum AccessRole {
  NEW_USER = -1,
  OWNER = 0,
  AUTHORITY = 1,
  UNKNOWN = 2,
}

export type LoginResponse = {
  access_role: AccessRole;
  lock_status?: LockStatus;
}

export type LoginRequest = {
  access_role: AccessRole;
  user_addr: string;
  owner_addr: string;
  lock_name: string;
}

export type RegisterNewLockRequest = {
  owner_addr: string;
  lock_name: string;
}

export enum AccessType {
  LOGIN = 0,
  REGISTER = 1,
}