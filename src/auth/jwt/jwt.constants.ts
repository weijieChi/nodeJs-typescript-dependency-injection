// 把「魔法數字」集中，不散落。

export const JWT_CONSTANTS = {
  ACCESS_TOKEN_TTL_SEC: 60 * 5, // 5 minutes
  REFRESH_TOKEN_TTL_SEC: 60 * 20, // 20 minutes // 考慮到測試方便度，可能會再縮短時間
};
