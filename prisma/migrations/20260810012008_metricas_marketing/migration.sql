-- CreateEnum
CREATE TYPE "FonteMetrica" AS ENUM ('ga4', 'google_ads', 'gsc');

-- CreateTable
CREATE TABLE "MetricaDiaria" (
    "id" BIGSERIAL NOT NULL,
    "fonte" "FonteMetrica" NOT NULL,
    "data" DATE NOT NULL,
    "metrica" TEXT NOT NULL,
    "valor" DECIMAL(16,4) NOT NULL,

    CONSTRAINT "MetricaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermoBusca" (
    "id" BIGSERIAL NOT NULL,
    "dimensao" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "termo" VARCHAR(600) NOT NULL,
    "cliques" INTEGER NOT NULL DEFAULT 0,
    "impressoes" INTEGER NOT NULL DEFAULT 0,
    "posicao" DECIMAL(7,2) NOT NULL,

    CONSTRAINT "TermoBusca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SincronizacaoMarketing" (
    "id" TEXT NOT NULL DEFAULT 'unica',
    "rodadaEm" TIMESTAMP(3),
    "resultado" TEXT,
    "comErro" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SincronizacaoMarketing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetricaDiaria_fonte_data_idx" ON "MetricaDiaria"("fonte", "data");

-- CreateIndex
CREATE UNIQUE INDEX "MetricaDiaria_fonte_data_metrica_key" ON "MetricaDiaria"("fonte", "data", "metrica");

-- CreateIndex
CREATE INDEX "TermoBusca_dimensao_data_idx" ON "TermoBusca"("dimensao", "data");

-- CreateIndex
CREATE UNIQUE INDEX "TermoBusca_dimensao_data_termo_key" ON "TermoBusca"("dimensao", "data", "termo");
