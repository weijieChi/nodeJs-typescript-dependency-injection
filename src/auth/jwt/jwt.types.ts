import { z } from "zod";

// access token
export const AccessTokenPayLoadSchema = z.object({
  sub: z.number(), // user id
  type: z.literal("ACCESS"),
  iat: z.number(), // issued at (UNIX timestamp)
  exp: z.number(), // expires at (UNIX timestamp)
});

export type AccessTokenPayload = z.infer<typeof AccessTokenPayLoadSchema>;

// refresh token
export const RefreshTokenPayloadSchema = z.object({
  sub: z.number(), // user id
  jti: z.uuidv7(), // token id (uuid v7)
  type: z.literal("REFRESH"),
  securityStamp: z.string(), // snapshot of user.securityStamp
  iat: z.number(), // issued at (UNIX timestamp)
  exp: z.number(), // expires at (UNIX timestamp)
});

export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

// 這不是必須，但會讓 verify flow 很乾淨。
export const JwtPayloadSchema = z.discriminatedUnion("type", [
  AccessTokenPayLoadSchema,
  RefreshTokenPayloadSchema,
]);

export type JwtPayload = z.infer<typeof JwtPayloadSchema>
