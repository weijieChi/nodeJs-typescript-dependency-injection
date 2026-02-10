import { z } from "zod";

// export interface RegisterDTO {
//   name: string;
//   password: string;
// }

// export interface LoginDTO {
//   name: string;
//   password: string;
// }

// DTO: Data Transfer Object
// 它的用途是： 在 Controller <-> Service <-> Repository 之間傳遞資料時，用的「固定資料格式」。

// Zod Schema（runtime 驗證 + 自動 TS 型別推導）
export const RegisterSchema = z.object({
  name: z.string().min(1, `"name" is required`),
  email: z.email("Email format error"),
  password: z.string().min(1, "Password is required"),
});

/**
 * 登入策略：
 * - session：瀏覽器 / SSR
 * - jwt：API / mobile / token-based
 */
export const LoginSchema = z.object({
  email: z.email("Email format error"),
  password: z.string().min(1, "Password is required"),
  authStrategy: z.enum(["session", "jwt"]).optional(),
});

// 自動產生 TypeScript 型別
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
