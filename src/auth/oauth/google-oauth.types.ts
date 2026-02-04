/**
 * 封裝後給 domain / use case 使用的「乾淨 Google 使用者資訊」
 * 不直接暴露 Google SDK 原始 payload
 */

export interface GoogleUserInfo {
  provider: "GOOGLE";
  providerUserId: string; // Google `sub`
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

// ⚠️ 注意：
// 我們不直接暴露 Google SDK 回傳的原始 payload
// 這是「防止未來 SDK 變動」的關鍵