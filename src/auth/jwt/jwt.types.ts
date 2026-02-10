import { z } from "zod";

// access token
export const AccessTokenPayloadSchema = z.object({
  sub: z.number(), // user id
  type: z.literal("ACCESS"),
  iat: z.number(), // issued at (UNIX timestamp)
  exp: z.number(), // expires at (UNIX timestamp)
});

export type AccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;

// refresh token
export const RefreshTokenPayloadSchema = z.object({
  sub: z.number(), // user id
  jti: z.uuidv7(), // token id (uuid v7)
  type: z.literal("REFRESH"),
  securityStamp: z.uuid(), // snapshot of user.securityStamp
  iat: z.number(), // issued at (UNIX timestamp)
  exp: z.number(), // expires at (UNIX timestamp)
});

export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

// 意思是：
// 如果 type === "ACCESS"
// payload 一定是 AccessTokenPayload
// 如果 type === "REFRESH"
// payload 一定是 RefreshTokenPayload
// 這不是必須，但會讓 verify flow 很乾淨。
export const JwtPayloadSchema = z.discriminatedUnion("type", [
  AccessTokenPayloadSchema,
  RefreshTokenPayloadSchema,
]);

export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
