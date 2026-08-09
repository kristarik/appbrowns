import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/gerado/prisma';

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const emDias = (dias: number) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d;
};

const haMinutos = (minutos: number) => new Date(Date.now() - minutos * 60000);

const SENHA_PADRAO = 'browns2026';

const main = async () => {
  // Ordem importa por causa das chaves estrangeiras.
  await db.mensagem.deleteMany();
  await db.conversa.deleteMany();
  await db.tarefa.deleteMany();
  await db.atendimento.deleteMany();
  await db.cliente.deleteMany();
  await db.usuario.deleteMany();

  const senhaHash = await hash(SENHA_PADRAO, 10);

  const [tarik, ana, bruno] = await Promise.all([
    db.usuario.create({
      data: { nome: 'Tarik', email: 'contato@kristarik.com.br', senhaHash, papel: 'admin' },
    }),
    db.usuario.create({
      data: { nome: 'Ana', email: 'ana@browns.com.br', senhaHash, papel: 'atendente' },
    }),
    db.usuario.create({
      data: { nome: 'Bruno', email: 'bruno@browns.com.br', senhaHash, papel: 'atendente' },
    }),
  ]);

  const clientes = await Promise.all(
    [
      { nome: 'Rafael Lima', telefone: '5511987654321', email: 'rafael.lima@email.com' },
      { nome: 'Joana Vieira', telefone: '5511976543210' },
      { nome: 'Marina Costa', telefone: '5511965432109', email: 'marina@email.com' },
      { nome: 'Lucas Mendonça', telefone: '5511954321098' },
      { nome: 'Camila Andrade', telefone: '5511943210987' },
      { nome: 'Eduardo Prado', telefone: '5511932109876' },
      { nome: 'Beatriz Nogueira', telefone: '5511921098765' },
      { nome: 'Thiago Ramos', telefone: '5511910987654' },
      { nome: 'Paulo Serrano', telefone: '5511909876543' },
      { nome: 'Helena Duarte', telefone: '5511998877665' },
    ].map((dados) => db.cliente.create({ data: dados })),
  );

  const [
    rafael,
    joana,
    marina,
    lucas,
    camila,
    eduardo,
    beatriz,
    thiago,
    paulo,
    helena,
  ] = clientes;

  const atendimentos = await Promise.all([
    db.atendimento.create({
      data: {
        clienteId: rafael.id,
        origem: 'instagram',
        canal: 'whatsapp',
        necessidade: 'terno_sob_medida',
        ocasiao: 'casamento',
        dataEvento: emDias(21),
        interesseInicial: 'Terno slim azul marinho',
        etapa: 'novo',
        responsavelId: ana.id,
        dados: {},
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: joana.id,
        origem: 'google_ads',
        canal: 'whatsapp',
        necessidade: 'aluguel',
        ocasiao: 'formatura',
        dataEvento: emDias(9),
        interesseInicial: 'Smoking preto',
        etapa: 'novo',
        responsavelId: ana.id,
        dados: {},
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: marina.id,
        origem: 'indicacao',
        canal: 'instagram',
        necessidade: 'ajuste',
        ocasiao: 'corporativo',
        dataEvento: emDias(4),
        interesseInicial: 'Ajuste de barra e cintura',
        etapa: 'atendimento_inicial',
        valor: 180,
        responsavelId: bruno.id,
        dados: {},
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: lucas.id,
        origem: 'google_ads',
        canal: 'whatsapp',
        necessidade: 'aluguel',
        ocasiao: 'casamento',
        dataEvento: emDias(35),
        interesseInicial: 'Terno para padrinho',
        etapa: 'agendado',
        valor: 890,
        responsavelId: ana.id,
        dados: {
          dataVisita: emDias(2).toISOString(),
          consultor: 'Ana',
          presencaConfirmada: true,
          origemAgendamento: 'whatsapp',
        },
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: camila.id,
        origem: 'site',
        canal: 'whatsapp',
        necessidade: 'terno_sob_medida',
        ocasiao: 'casamento',
        dataEvento: emDias(52),
        interesseInicial: 'Terno do noivo, tecido italiano',
        etapa: 'agendado',
        valor: 3200,
        responsavelId: bruno.id,
        // Checklist incompleto de proposito, para o aviso de pendencia aparecer.
        dados: { dataVisita: emDias(1).toISOString(), consultor: 'Bruno' },
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: eduardo.id,
        origem: 'instagram',
        canal: 'instagram',
        necessidade: 'camisa_sob_medida',
        ocasiao: 'aniversario',
        dataEvento: emDias(14),
        interesseInicial: 'Duas camisas de linho',
        etapa: 'decidindo',
        valor: 640,
        responsavelId: ana.id,
        dados: {
          dataVisitaRealizada: emDias(-2).toISOString(),
          produtosExperimentados: 'Linho off-white e linho azul claro',
          orcamentoApresentado: 640,
          objecaoPrincipal: 'Achou o valor alto para duas peças',
          proximoContato: emDias(1).toISOString(),
        },
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: beatriz.id,
        origem: 'passou_na_loja',
        canal: 'telefone',
        necessidade: 'terno_sob_medida',
        ocasiao: 'formatura',
        dataEvento: emDias(6),
        etapa: 'em_provas',
        valor: 2850,
        responsavelId: bruno.id,
        dados: {
          proximaProva: emDias(1).toISOString(),
          previsaoLiberacao: emDias(4).toISOString(),
        },
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: thiago.id,
        origem: 'indicacao',
        canal: 'whatsapp',
        necessidade: 'terno_sob_medida',
        ocasiao: 'casamento',
        dataEvento: emDias(28),
        etapa: 'aguardando_retirada',
        valor: 4100,
        responsavelId: bruno.id,
        dados: {
          vendaConfirmada: true,
          dataRetirada: emDias(3).toISOString(),
          horarioRetirada: '14:00',
        },
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: paulo.id,
        origem: 'facebook',
        canal: 'whatsapp',
        necessidade: 'aluguel',
        ocasiao: 'casamento',
        dataEvento: emDias(-2),
        etapa: 'em_locacao',
        valor: 750,
        responsavelId: ana.id,
        dados: {
          dataRetiradaLocacao: emDias(-4).toISOString(),
          previsaoDevolucao: emDias(1).toISOString(),
        },
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: helena.id,
        origem: 'google_ads',
        canal: 'whatsapp',
        necessidade: 'aluguel',
        ocasiao: 'formatura',
        dataEvento: emDias(-15),
        etapa: 'finalizado',
        valor: 720,
        responsavelId: ana.id,
        dados: { clienteSatisfeito: true, avaliacaoRecebida: true, fotoAutorizada: false },
      },
    }),
    db.atendimento.create({
      data: {
        clienteId: marina.id,
        origem: 'instagram',
        canal: 'whatsapp',
        necessidade: 'aluguel',
        ocasiao: 'outro',
        dataEvento: emDias(-22),
        etapa: 'perdido',
        responsavelId: ana.id,
        motivoPerda: 'prazo',
        dados: { motivoPerda: 'prazo' },
      },
    }),
  ]);

  const [aRafael, aJoana, , aLucas, aCamila, aEduardo, aBeatriz, aThiago, aPaulo, aHelena] =
    atendimentos;

  await db.tarefa.createMany({
    data: [
      { atendimentoId: aRafael.id, titulo: 'Primeiro atendimento imediato', etapaOrigem: 'novo', venceEm: haMinutos(-30), responsavelId: ana.id },
      { atendimentoId: aJoana.id, titulo: 'Nova tentativa no dia seguinte', etapaOrigem: 'novo', venceEm: emDias(1), responsavelId: ana.id },
      { atendimentoId: aLucas.id, titulo: 'Lembrete 24 horas antes da visita', etapaOrigem: 'agendado', venceEm: emDias(1), responsavelId: ana.id },
      { atendimentoId: aCamila.id, titulo: 'Confirmação no dia da visita', etapaOrigem: 'agendado', venceEm: emDias(1), responsavelId: bruno.id },
      { atendimentoId: aEduardo.id, titulo: 'Novo contato alguns dias depois', etapaOrigem: 'decidindo', venceEm: emDias(1), responsavelId: ana.id },
      { atendimentoId: aBeatriz.id, titulo: 'Confirmação de comparecimento na prova', etapaOrigem: 'em_provas', venceEm: haMinutos(120), responsavelId: bruno.id },
      { atendimentoId: aThiago.id, titulo: 'Lembrete da retirada', etapaOrigem: 'aguardando_retirada', venceEm: emDias(2), responsavelId: bruno.id },
      { atendimentoId: aPaulo.id, titulo: 'Lembrete antes do vencimento da devolução', etapaOrigem: 'em_locacao', venceEm: haMinutos(-90), responsavelId: ana.id },
      { atendimentoId: aHelena.id, titulo: 'Pedido de avaliação', etapaOrigem: 'finalizado', venceEm: emDias(-14), concluida: true, concluidaEm: emDias(-14), responsavelId: ana.id },
    ],
  });

  const conversas = await Promise.all(
    [
      { clienteId: rafael.id, canal: 'whatsapp' as const, naoLidas: 2, ultimaMensagem: 'Consigo passar aí essa semana para tirar as medidas?', ultimaMensagemEm: haMinutos(15), responsavelId: ana.id },
      { clienteId: joana.id, canal: 'whatsapp' as const, naoLidas: 1, ultimaMensagem: 'Vocês têm smoking preto no meu tamanho?', ultimaMensagemEm: haMinutos(48), responsavelId: ana.id },
      { clienteId: marina.id, canal: 'instagram' as const, naoLidas: 3, ultimaMensagem: 'Quanto fica o ajuste da barra?', ultimaMensagemEm: haMinutos(132) },
      { clienteId: lucas.id, canal: 'whatsapp' as const, naoLidas: 0, ultimaMensagem: 'Confirmado, chego às 15h', ultimaMensagemEm: haMinutos(200), responsavelId: bruno.id },
      { clienteId: camila.id, canal: 'whatsapp' as const, naoLidas: 0, ultimaMensagem: 'Consigo remarcar para quinta?', ultimaMensagemEm: emDias(-1), responsavelId: bruno.id },
      { clienteId: eduardo.id, canal: 'instagram' as const, naoLidas: 1, ultimaMensagem: 'Vocês fazem camisa de linho?', ultimaMensagemEm: emDias(-1) },
      { clienteId: beatriz.id, canal: 'whatsapp' as const, naoLidas: 0, ultimaMensagem: 'Confirmado para quinta então', ultimaMensagemEm: emDias(-2), responsavelId: bruno.id },
      { clienteId: thiago.id, canal: 'whatsapp' as const, naoLidas: 0, status: 'resolvida' as const, ultimaMensagem: 'Perfeito, muito obrigado!', ultimaMensagemEm: emDias(-3), responsavelId: bruno.id },
    ].map((dados) => db.conversa.create({ data: dados })),
  );

  await db.mensagem.createMany({
    data: [
      { conversaId: conversas[0].id, direcao: 'recebida', autor: 'cliente', conteudo: 'Boa tarde! Vi o perfil de vocês no Instagram', enviadaEm: haMinutos(95) },
      { conversaId: conversas[0].id, direcao: 'enviada', autor: 'atendente', conteudo: 'Boa tarde, Rafael! Seja bem-vindo à Browns. Como posso ajudar?', enviadaEm: haMinutos(90), enviadaPorId: ana.id },
      { conversaId: conversas[0].id, direcao: 'recebida', autor: 'cliente', conteudo: 'Vou casar em novembro e queria fazer um terno sob medida. Vocês conseguem no prazo?', enviadaEm: haMinutos(84) },
      { conversaId: conversas[0].id, direcao: 'enviada', autor: 'atendente', conteudo: 'Conseguimos sim! Para sob medida trabalhamos com 45 dias, então novembro está tranquilo. Qual a data exata do casamento?', enviadaEm: haMinutos(80), enviadaPorId: ana.id },
      { conversaId: conversas[0].id, direcao: 'recebida', autor: 'cliente', conteudo: 'Dia 27 de novembro', enviadaEm: haMinutos(20) },
      { conversaId: conversas[0].id, direcao: 'recebida', autor: 'cliente', conteudo: 'Consigo passar aí essa semana para tirar as medidas?', enviadaEm: haMinutos(15) },
      { conversaId: conversas[1].id, direcao: 'recebida', autor: 'cliente', conteudo: 'Oi! Preciso de um smoking para a formatura', enviadaEm: haMinutos(60) },
      { conversaId: conversas[1].id, direcao: 'recebida', autor: 'cliente', conteudo: 'Vocês têm smoking preto no meu tamanho?', enviadaEm: haMinutos(48) },
      { conversaId: conversas[2].id, direcao: 'recebida', autor: 'cliente', conteudo: 'Quanto fica o ajuste da barra?', enviadaEm: haMinutos(132) },
    ],
  });

  console.log('Banco populado:');
  console.log(`  usuarios     ${await db.usuario.count()}`);
  console.log(`  clientes     ${await db.cliente.count()}`);
  console.log(`  atendimentos ${await db.atendimento.count()}`);
  console.log(`  tarefas      ${await db.tarefa.count()}`);
  console.log(`  conversas    ${await db.conversa.count()}`);
  console.log(`  mensagens    ${await db.mensagem.count()}`);
  console.log('');
  console.log(`Login: ${tarik.email}`);
  console.log(`Senha: ${SENHA_PADRAO}  (trocar depois de entrar)`);
};

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
