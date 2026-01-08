import type { TxBuildRequest, AuthorityRequest } from './types';

export function validateTxBuildRequest(body: any): TxBuildRequest {
  if (!body.walletAddress || typeof body.walletAddress !== 'string') {
    throw new Error('walletAddress is required and must be a string');
  }

  // Validate address format (basic check)
  if (
    !body.walletAddress.startsWith('addr_test') &&
    !body.walletAddress.startsWith('addr1')
  ) {
    throw new Error('Invalid wallet address format');
  }

  return {
    walletAddress: body.walletAddress,
  };
}

export function validateAuthorityRequest(body: any): AuthorityRequest {
  const baseRequest = validateTxBuildRequest(body);

  if (!body.newAuthority || typeof body.newAuthority !== 'string') {
    throw new Error('newAuthority is required for authority transfer');
  }

  if (
    !body.newAuthority.startsWith('addr_test') &&
    !body.newAuthority.startsWith('addr1')
  ) {
    throw new Error('Invalid newAuthority address format');
  }

  return {
    ...baseRequest,
    newAuthority: body.newAuthority,
  };
}
