export type LockRequest = {
    is_unlock: boolean;
    unlocker_addr: string;
    time?: Date;
}

export type LockStatus = {
    lock_status: boolean;
    user_addr: string;
    time: Date;
    tx_ref: string;
}