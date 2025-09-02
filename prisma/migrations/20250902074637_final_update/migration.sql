-- DropEnum
DROP TYPE "crdb_internal_region";

-- CreateTable
CREATE TABLE "asset_pairs" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "asset_pair" STRING NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "asset_pairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "name" STRING NOT NULL,
    "email" STRING NOT NULL,
    "password" STRING NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balances" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "user_id" INT8 NOT NULL,
    "balances" JSONB NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orderBooks" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "user_id" INT8,
    "asset_pair_id" INT8 NOT NULL,
    "currency" STRING,
    "quantity" STRING NOT NULL,
    "price" STRING NOT NULL,
    "status" STRING NOT NULL,
    "order_catagory" STRING,
    "order_type" STRING,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "orderBooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "user_id" INT8 NOT NULL,
    "orderBook_id" INT8 NOT NULL,
    "asset_pair" STRING,
    "amount" STRING,
    "offerPrice" STRING NOT NULL,
    "tradePrice" STRING NOT NULL,
    "quantity" STRING NOT NULL,
    "orderType" STRING,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CentralizeBalances" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "user_id" INT8 NOT NULL,
    "balance" JSONB NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "deletedAt" TIMESTAMP(6),

    CONSTRAINT "CentralizeBalances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CentralizeBalances_user_id_key" ON "CentralizeBalances"("user_id");

-- AddForeignKey
ALTER TABLE "orderBooks" ADD CONSTRAINT "orderBooks_asset_pair_id_fkey" FOREIGN KEY ("asset_pair_id") REFERENCES "asset_pairs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
