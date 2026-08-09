-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('admin', 'atendente');

-- CreateEnum
CREATE TYPE "Necessidade" AS ENUM ('aluguel', 'terno_sob_medida', 'camisa_sob_medida', 'ajuste');

-- CreateEnum
CREATE TYPE "Ocasiao" AS ENUM ('casamento', 'formatura', 'corporativo', 'aniversario', 'outro');

-- CreateEnum
CREATE TYPE "Etapa" AS ENUM ('novo', 'atendimento_inicial', 'agendado', 'decidindo', 'aguardando_retirada', 'em_provas', 'em_locacao', 'finalizado', 'perdido');

-- CreateEnum
CREATE TYPE "Canal" AS ENUM ('whatsapp', 'instagram', 'telefone');

-- CreateEnum
CREATE TYPE "OrigemLead" AS ENUM ('google_ads', 'instagram', 'facebook', 'indicacao', 'passou_na_loja', 'site', 'outro');

-- CreateEnum
CREATE TYPE "MotivoPerda" AS ENUM ('preco', 'estoque', 'prazo', 'concorrencia', 'sem_retorno');

-- CreateEnum
CREATE TYPE "StatusConversa" AS ENUM ('aberta', 'resolvida');

-- CreateEnum
CREATE TYPE "DirecaoMensagem" AS ENUM ('recebida', 'enviada');

-- CreateEnum
CREATE TYPE "AutorMensagem" AS ENUM ('cliente', 'atendente', 'sistema');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL DEFAULT 'atendente',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atendimento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "origem" "OrigemLead" NOT NULL,
    "canal" "Canal" NOT NULL,
    "necessidade" "Necessidade" NOT NULL,
    "ocasiao" "Ocasiao",
    "dataEvento" TIMESTAMP(3),
    "interesseInicial" TEXT,
    "etapa" "Etapa" NOT NULL DEFAULT 'novo',
    "valor" DECIMAL(10,2),
    "responsavelId" TEXT,
    "motivoPerda" "MotivoPerda",
    "dados" JSONB NOT NULL DEFAULT '{}',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "etapaOrigem" "Etapa" NOT NULL,
    "venceEm" TIMESTAMP(3) NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMP(3),
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversa" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "canal" "Canal" NOT NULL,
    "status" "StatusConversa" NOT NULL DEFAULT 'aberta',
    "naoLidas" INTEGER NOT NULL DEFAULT 0,
    "ultimaMensagem" TEXT,
    "ultimaMensagemEm" TIMESTAMP(3),
    "responsavelId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensagem" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "direcao" "DirecaoMensagem" NOT NULL,
    "autor" "AutorMensagem" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "idExterno" TEXT,
    "enviadaPorId" TEXT,
    "enviadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_telefone_key" ON "Cliente"("telefone");

-- CreateIndex
CREATE INDEX "Cliente_nome_idx" ON "Cliente"("nome");

-- CreateIndex
CREATE INDEX "Atendimento_etapa_idx" ON "Atendimento"("etapa");

-- CreateIndex
CREATE INDEX "Atendimento_dataEvento_idx" ON "Atendimento"("dataEvento");

-- CreateIndex
CREATE INDEX "Atendimento_origem_idx" ON "Atendimento"("origem");

-- CreateIndex
CREATE INDEX "Tarefa_venceEm_concluida_idx" ON "Tarefa"("venceEm", "concluida");

-- CreateIndex
CREATE INDEX "Conversa_status_ultimaMensagemEm_idx" ON "Conversa"("status", "ultimaMensagemEm");

-- CreateIndex
CREATE UNIQUE INDEX "Mensagem_idExterno_key" ON "Mensagem"("idExterno");

-- CreateIndex
CREATE INDEX "Mensagem_conversaId_enviadaEm_idx" ON "Mensagem"("conversaId", "enviadaEm");

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversa" ADD CONSTRAINT "Conversa_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "Conversa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensagem" ADD CONSTRAINT "Mensagem_enviadaPorId_fkey" FOREIGN KEY ("enviadaPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
