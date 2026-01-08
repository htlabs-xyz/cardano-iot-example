import { NextRequest, NextResponse } from 'next/server';

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error) {
      console.error('API Error:', error);

      const message =
        error instanceof Error ? error.message : 'Unknown error';
      const isKnownError =
        error instanceof Error &&
        (message.includes('not found') ||
          message.includes('already') ||
          message.includes('Initialize') ||
          message.includes('No UTXOs') ||
          message.includes('collateral'));

      return NextResponse.json(
        {
          error: message,
          code: isKnownError ? 'BUSINESS_ERROR' : 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: isKnownError ? 400 : 500 }
      );
    }
  };
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
