export enum LockStatus {
  NEW_LOCK = -1,
  OPEN = 0,
  CLOSE = 1,
}

export const parseLockStatus = (status: number): LockStatus => {
  switch (status) {
    case -1:
      return LockStatus.NEW_LOCK;
    case 1:
      return LockStatus.CLOSE;
    case 0:
      return LockStatus.OPEN;
    default:
      return LockStatus.CLOSE;
  }
};

export type LockRequest = {
  lock_status: LockStatus;
  lock_name: string;
  unlocker_addr: string;
  owner_addr: string;
  time?: Date;
};

export type AuthorizeRequest = {
  is_remove_authorize: boolean;
  lock_name: string;
  owner_addr: string;
  licensee_addr: string;
  time?: Date;
};

export type LockInfoRequest = {
  lock_name: string;
  owner_addr: string;
};

export type LockStatusResponse = {
  lock_status: LockStatus;
  user_addr: string;
  time: Date;
  tx_ref: string;
};

