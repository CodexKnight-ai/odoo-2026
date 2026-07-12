-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED');
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED');
CREATE TYPE "TripStatus" AS ENUM ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ExpenseType" AS ENUM ('TOLL', 'PARKING', 'MAINTENANCE', 'OTHER');

ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "Vehicle" (
  "id" SERIAL NOT NULL, "registrationNumber" TEXT NOT NULL, "name" TEXT NOT NULL, "type" TEXT NOT NULL,
  "maxLoadCapacity" DECIMAL(12,2) NOT NULL, "odometer" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "acquisitionCost" DECIMAL(14,2) NOT NULL DEFAULT 0, "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
  "region" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Driver" (
  "id" SERIAL NOT NULL, "name" TEXT NOT NULL, "licenseNumber" TEXT NOT NULL, "licenseCategory" TEXT NOT NULL,
  "licenseExpiryDate" TIMESTAMP(3) NOT NULL, "contactNumber" TEXT NOT NULL, "safetyScore" DECIMAL(5,2) NOT NULL DEFAULT 100,
  "status" "DriverStatus" NOT NULL DEFAULT 'AVAILABLE', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Trip" (
  "id" SERIAL NOT NULL, "source" TEXT NOT NULL, "destination" TEXT NOT NULL, "cargoWeight" DECIMAL(12,2) NOT NULL,
  "plannedDistance" DECIMAL(12,2) NOT NULL, "actualDistance" DECIMAL(12,2), "revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "finalOdometer" DECIMAL(14,2), "status" "TripStatus" NOT NULL DEFAULT 'DRAFT', "dispatchedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "vehicleId" INTEGER NOT NULL, "driverId" INTEGER NOT NULL,
  CONSTRAINT "Trip_pkey" PRIMARY KEY ("id"), CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "MaintenanceLog" (
  "id" SERIAL NOT NULL, "description" TEXT NOT NULL, "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN', "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3), "cost" DECIMAL(14,2) NOT NULL DEFAULT 0, "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "vehicleId" INTEGER NOT NULL,
  CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id"), CONSTRAINT "MaintenanceLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "FuelLog" (
  "id" SERIAL NOT NULL, "liters" DECIMAL(12,2) NOT NULL, "cost" DECIMAL(14,2) NOT NULL, "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "odometer" DECIMAL(14,2), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "vehicleId" INTEGER NOT NULL, "tripId" INTEGER,
  CONSTRAINT "FuelLog_pkey" PRIMARY KEY ("id"), CONSTRAINT "FuelLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FuelLog_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE "Expense" (
  "id" SERIAL NOT NULL, "type" "ExpenseType" NOT NULL, "amount" DECIMAL(14,2) NOT NULL, "description" TEXT, "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "vehicleId" INTEGER NOT NULL, "tripId" INTEGER,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id"), CONSTRAINT "Expense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "Expense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Vehicle_registrationNumber_key" ON "Vehicle"("registrationNumber");
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "Driver"("licenseNumber");
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status"); CREATE INDEX "Vehicle_region_idx" ON "Vehicle"("region");
CREATE INDEX "Driver_status_idx" ON "Driver"("status"); CREATE INDEX "Driver_licenseExpiryDate_idx" ON "Driver"("licenseExpiryDate");
CREATE INDEX "Trip_status_idx" ON "Trip"("status"); CREATE INDEX "Trip_vehicleId_status_idx" ON "Trip"("vehicleId", "status"); CREATE INDEX "Trip_driverId_status_idx" ON "Trip"("driverId", "status");
CREATE INDEX "MaintenanceLog_vehicleId_status_idx" ON "MaintenanceLog"("vehicleId", "status"); CREATE INDEX "MaintenanceLog_status_idx" ON "MaintenanceLog"("status");
CREATE INDEX "FuelLog_vehicleId_date_idx" ON "FuelLog"("vehicleId", "date"); CREATE INDEX "Expense_vehicleId_date_idx" ON "Expense"("vehicleId", "date"); CREATE INDEX "Expense_type_idx" ON "Expense"("type");
