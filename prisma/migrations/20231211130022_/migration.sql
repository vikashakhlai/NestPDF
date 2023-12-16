-- CreateTable
CREATE TABLE "user" (
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "pdf" BYTEA NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("email")
);
