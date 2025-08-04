-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(0) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "deletedAt" TIMESTAMP(0),
    "deletedBy" VARCHAR(36),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "speed" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(0) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "deletedAt" TIMESTAMP(0),
    "deletedBy" VARCHAR(36),

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customers" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(0) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "deletedAt" TIMESTAMP(0),
    "deletedBy" VARCHAR(36),

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "id" TEXT NOT NULL,
    "serviceNumber" VARCHAR(50) NOT NULL,
    "customerId" VARCHAR(36) NOT NULL,
    "productId" VARCHAR(36) NOT NULL,
    "startDate" TIMESTAMP(0) NOT NULL,
    "endDate" TIMESTAMP(0) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(0) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "deletedAt" TIMESTAMP(0),
    "deletedBy" VARCHAR(36),

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" VARCHAR(50) NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "invoiceDate" TIMESTAMP(0) NOT NULL,
    "dueDate" TIMESTAMP(0) NOT NULL,
    "subscriptionId" VARCHAR(36) NOT NULL,
    "customerId" VARCHAR(36) NOT NULL,
    "productId" VARCHAR(36) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(0) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "deletedAt" TIMESTAMP(0),
    "deletedBy" VARCHAR(36),

    CONSTRAINT "Invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "invoiceId" VARCHAR(36) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(0) NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "updatedAt" TIMESTAMP(0) NOT NULL,
    "updatedBy" VARCHAR(36) NOT NULL DEFAULT 'system',
    "deletedAt" TIMESTAMP(0),
    "deletedBy" VARCHAR(36),

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phone_key" ON "Users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Products_name_key" ON "Products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriptions_serviceNumber_key" ON "Subscriptions"("serviceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoices_invoiceNumber_key" ON "Invoices"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
