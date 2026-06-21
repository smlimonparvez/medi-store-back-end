-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_method" TEXT NOT NULL DEFAULT 'cod',
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "stripe_session_id" TEXT;
