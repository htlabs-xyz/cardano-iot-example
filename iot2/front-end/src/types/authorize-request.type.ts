export type AuthorizeRequest = {
    is_remove_authorize: boolean;
    authorizer_addr: string;
    licensee_addr: string;
    timestamp: Date;
}
