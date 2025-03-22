export type ApiResponse<T> = {
    status: boolean;
    statusCode: number;
    path: string;
    message: string;
    data?: T;
    timestamp: string;
}

export type UnsignTxResponse = {
    unSignedTx: string
}

export type SubmitTxResponse = {
    tx_hash: string,
    tx_ref: string
}


