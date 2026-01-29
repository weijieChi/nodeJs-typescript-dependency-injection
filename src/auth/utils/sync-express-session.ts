import { pool } from "../../libs/pg.js";

export async function syncExpressSession(
  sid: string,
  userId: number,
  securityStamp: string
) {
  await pool.query(
    `
    UPDATE express_sessions
    SET "userId" = $1,
        "securityStamp" = $2
    WHERE sid = $3
    `,
    [userId, securityStamp, sid]
  );
}