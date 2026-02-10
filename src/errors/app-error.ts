export class AppError extends Error {
  statusCode: number;
  meta?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 400,
    meta?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    // ✔ meta 不存在 → property 不存在
    // ✔ meta 存在 → 一定是正確型別
    // ✔ 完全符合 exactOptionalPropertyTypes 的設計理念
    if (meta !== undefined) {
      this.meta = meta;
    }
  }
}
