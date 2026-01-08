import type { InitRequest, UnitTxRequest, AuthorityRequest } from './types';

function validateAddress(address: string, fieldName: string): void {
  if (!address || typeof address !== 'string') {
    throw new Error(`${fieldName} is required and must be a string`);
  }
  if (!address.startsWith('addr_test') && !address.startsWith('addr1')) {
    throw new Error(`Invalid ${fieldName} format`);
  }
}

// For init - uses title
export function validateInitRequest(body: any): InitRequest {
  validateAddress(body.walletAddress, 'walletAddress');

  if (!body.title || typeof body.title !== 'string') {
    throw new Error('title is required and must be a string');
  }

  return {
    walletAddress: body.walletAddress,
    title: body.title,
  };
}

// For lock/unlock - uses unit
export function validateUnitTxRequest(body: any): UnitTxRequest {
  validateAddress(body.walletAddress, 'walletAddress');

  if (!body.unit || typeof body.unit !== 'string') {
    throw new Error('unit is required and must be a string');
  }

  return {
    walletAddress: body.walletAddress,
    unit: body.unit,
  };
}

// For authority transfer - uses unit
export function validateAuthorityRequest(body: any): AuthorityRequest {
  const baseRequest = validateUnitTxRequest(body);

  validateAddress(body.newAuthority, 'newAuthority');

  return {
    ...baseRequest,
    newAuthority: body.newAuthority,
  };
}

// Legacy - for backward compatibility
export function validateTxBuildRequest(body: any): InitRequest {
  return validateInitRequest(body);
}
