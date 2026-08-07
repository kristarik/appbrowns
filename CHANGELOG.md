# Histórico de versões

## v0.2.1 - Kanban utilizável

Correção de dois problemas que deixavam o quadro inutilizável.

### Quadro espremido

O painel de chat e o de detalhes ocupavam 704px dos 944px disponíveis, sobrando
240px para as nove colunas. Na prática dava para ver uma coluna e meia.

O que mudou:

- Nenhum card vem selecionado ao abrir, então o quadro usa a largura toda
- O painel de detalhes não abre mais sozinho no kanban
- Botão "Fechar conversa" devolve o quadro inteiro a qualquer momento
- Colunas de 288px para 256px, cabe mais coisa na tela

### Arrastar cards

Agora funciona. Segura o card e solta na coluna destino. A coluna alvo fica
destacada em azul durante o arraste, e a alça de arraste aparece ao passar o
mouse sobre o card.

Ao mudar de etapa, o checklist e os avisos de pendência recalculam sozinhos.

Importante: como ainda não existe banco, mover um card só vale até recarregar a
página. Persistência de verdade entra na v0.3.0.

### Correções menores

- Componente declarado dentro do render na barra de ícones, que zerava estado a
  cada renderização
- Concordância: "1 atrasada" e "em 1 dia" no lugar de "1 atrasadas" e "em 1 dias"

## v0.2.0 - Funil real

Substitui o funil inventado pelo funil de verdade da loja, a partir da tabela de
status enviada pelo time. Continua com dados simulados.

### Etapas

As sete etapas chutadas viraram as nove reais: Novo, Atendimento inicial,
Agendado, Decidindo, Aguardando retirada, Em provas e ajustes, Em locação,
Finalizado, Perdido.

Aluguel e sob medida seguem caminhos diferentes. Ao filtrar por interesse, as
colunas que não se aplicam somem do quadro: aluguel não passa por provas, sob
medida nunca entra em locação.

### Checklist por etapa

Cada etapa exige campos próprios, definidos em `lib/funil.ts`. O card mostra
quantos faltam e o painel lateral lista item por item.

Avisa mas não bloqueia: a atendente costuma estar com o cliente na frente.

### Follow-ups

Tela nova. Cada etapa define seus follow-ups, que viram tarefas com prazo. As
atrasadas aparecem destacadas. Sem disparo automático de mensagem.

### Campos novos

Origem do lead, canal de entrada, ocasião (antes chamada de tipo de evento) e
interesse inicial. Origem do lead é o que vai ligar o investimento em anúncio ao
faturamento no relatório de marketing.

### Relatórios

Separados em Comercial e Marketing, com o escopo de cada um documentado na tela.
Ainda não construídos.

## v0.1.0 - Fundação

Primeira versão navegável. Todo o conteúdo vem de dados simulados em
`lib/dados-simulados.ts`. Nada é salvo, nada é real.

O objetivo desta versão é validar o layout antes de investir em banco e
integrações.

### Telas

- **Chat** com lista de conversas, histórico e painel lateral do cliente
- **Kanban** com sete etapas e o chat acoplado na mesma tela
- **Clientes** em tabela, com busca e as colunas de filtro definidas
- **Login** visual
- Relatórios, Notificações e Configurações sinalizadas como não construídas

### Estrutura

- Barra de ícones fixa com logo, seções e versão visível
- Sidebar colapsável, com conteúdo que muda conforme a seção
- Urgência calculada pela data do evento: vermelho até 7 dias, laranja até 21

### Ainda não existe

- Autenticação de verdade
- Banco de dados
- Arrastar cards entre colunas
- WhatsApp e Bling
- Relatórios
