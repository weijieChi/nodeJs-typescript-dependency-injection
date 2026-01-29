-- CreateTable
CREATE TABLE "express_sessions" (
    "sid" VARCHAR(255) NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "express_sessions_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE INDEX "express_sessions_expire_idx" ON "express_sessions"("expire");
