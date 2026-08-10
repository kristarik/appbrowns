-- AlterTable
ALTER TABLE "Configuracao" ADD COLUMN     "corSuave" TEXT NOT NULL DEFAULT '#fae9db',
ALTER COLUMN "corMarca" SET DEFAULT '#4d322e',
ALTER COLUMN "logoUrl" SET DEFAULT '/marca/logo.svg';
