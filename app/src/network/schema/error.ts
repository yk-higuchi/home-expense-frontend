export class JSONParseError extends Error {
  override readonly name = "JSONParseError";
}

export class JSONSerializeError extends Error {
  override readonly name = "JSONSerializeError";
}
