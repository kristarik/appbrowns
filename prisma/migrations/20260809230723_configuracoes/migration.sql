-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL DEFAULT 'unica',
    "nomeLoja" TEXT NOT NULL DEFAULT 'Browns Alfaiataria',
    "corMarca" TEXT NOT NULL DEFAULT '#1b6df0',
    "logoUrl" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integracao" (
    "id" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT false,
    "dados" JSONB NOT NULL DEFAULT '{}',
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integracao_pkey" PRIMARY KEY ("id")
);
