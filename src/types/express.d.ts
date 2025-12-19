import type { User as PrismaUser } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    // 這不是「空型別」
    // 這是 TypeScript 官方建議的 declaration merging 用法
    // ESLint 在這裡是「誤判」
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends PrismaUser {}
  }
}