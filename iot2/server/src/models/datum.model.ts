export interface BytesField {
  bytes: string;
}
export interface IntField {
  int: number;
}

export interface Constr<TFields extends unknown[] = unknown[]> {
  constructor: number;
  fields: TFields;
}

type InnerBytesConstr = Constr<[BytesField, BytesField]>;

export type DatumModel = Constr<[InnerBytesConstr, IntField]>;
