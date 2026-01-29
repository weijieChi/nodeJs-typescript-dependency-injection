import type { Prisma} from "../generated/prisma/client.js";

export type SafeUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    securityStamp: true;
    createdAt: true;
    updatedAt: true;
  };
}>;


declare global {
  namespace Express {
    // 這不是「空型別」
    // 這是 TypeScript 官方建議的 declaration merging 用法
    // ESLint 在這裡是「誤判」
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends SafeUser {}
    // interface User extends PrismaUser {}
  }
}
