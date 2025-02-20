import { BlockfrostProvider } from '@meshsdk/core';
import { decodeFirst, Tagged } from 'cbor';

export const blockfrostProvider = new BlockfrostProvider(
  process.env.BLOCKFROST_API_KEY || '',
);

export function convertToJSON(decoded: any) {
  if (Buffer.isBuffer(decoded)) {
    return { bytes: decoded.toString('hex') };
  } else if (typeof decoded === 'number') {
    return { int: decoded };
  } else if (typeof decoded === 'bigint') {
    return { int: decoded.toString() };
  } else if (decoded instanceof Tagged) {
    const fields = decoded.value.map(function (item: any) {
      if (Buffer.isBuffer(item)) {
        return { bytes: item.toString('hex') };
      } else if (typeof item === 'number') {
        return { int: item };
      } else {
        return null;
      }
    });

    return {
      fields: fields.filter(function (item: any) {
        return item !== null;
      }),
      constructor: decoded.tag,
    };
  }
}
export const convertInlineDatum = async function ({
  inlineDatum,
}: {
  inlineDatum: string;
}) {
  try {
    const cborDatum: Buffer = Buffer.from(inlineDatum, 'hex');
    const decoded = await decodeFirst(cborDatum);
    const jsonStructure = {
      fields: decoded.value.map((item: any) => convertToJSON(item)),
      constructor: decoded.tag,
    };
    return jsonStructure;
  } catch (error) {
    return null;
  }
};

export async function datumToJson(
  datum: string,
  option?: {
    contain_pk?: boolean;
  },
): Promise<unknown> {
  const cborDatum: Buffer = Buffer.from(datum, 'hex');
  const datumMap = (await decodeFirst(cborDatum)).value[0];
  if (!(datumMap instanceof Map)) {
    throw new Error('Invalid Datum');
  }
  const obj: Record<string, string> = {};
  datumMap.forEach((value, key) => {
    const keyStr = key.toString('utf-8');
    if (keyStr === '_pk' && !option?.contain_pk) {
      return;
    }
    obj[keyStr] =
      keyStr !== '_pk' ? value.toString('utf-8') : value.toString('hex');
  });
  return obj;
}

export async function getPkHash(datum: string) {
  const cborDatum: Buffer = Buffer.from(datum, 'hex');
  const decoded = await decodeFirst(cborDatum);
  for (const [key, value] of decoded.value[0]) {
    if (key.toString('utf-8') === '_pk') {
      return value.toString('hex');
    }
  }
  return null;
}
