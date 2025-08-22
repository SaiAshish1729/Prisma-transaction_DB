-- DropEnum
DROP TYPE "crdb_internal_region";

-- CreateTable
CREATE TABLE "users" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "name" STRING NOT NULL,
    "email" STRING NOT NULL,
    "password" STRING NOT NULL,
    "eth_balance" STRING NOT NULL,
    "usd_balance" STRING NOT NULL,
    "kanch_balance" STRING NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderBooks" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "buyer_id" INT8 NOT NULL,
    "seller_id" INT8 NOT NULL,
    "currency" STRING NOT NULL,
    "quantity" STRING NOT NULL,
    "price" STRING NOT NULL,
    "status" STRING NOT NULL,
    "order_catagory" STRING NOT NULL,
    "order_type" STRING NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "orderBooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- AddForeignKey
ALTER TABLE "orderBooks" ADD CONSTRAINT "orderBooks_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderBooks" ADD CONSTRAINT "orderBooks_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
