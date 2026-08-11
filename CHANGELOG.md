# Histórico de versões

## v0.8.0 - WhatsApp recebendo

O painel passa a receber mensagens do WhatsApp e transformá-las em atendimento
sozinho.

Endereço do webhook: `https://app.alfaiatariabrowns.com.br/api/whatsapp`

### O que acontece quando chega uma mensagem

1. O painel confere a assinatura, provando que veio da Meta
2. Acha o cliente pelo telefone, ou cria um novo com o nome do perfil
3. Abre a conversa no canal WhatsApp, ou reabre se estava resolvida
4. Grava a mensagem e soma uma não lida
5. Se o cliente não tiver atendimento em aberto, cria um na etapa Novo

### Duas proteções

**Assinatura.** Sem conferir, qualquer um que descobrisse o endereço poderia
inventar clientes no painel. A conferência usa o App Secret e comparação de
tempo constante.

**Mensagem repetida.** A Meta reenvia o mesmo evento quando não recebe
confirmação rápida. O identificador da mensagem é único no banco, então a
segunda chegada é ignorada em vez de duplicar a conversa.

Quando o processamento falha, o painel devolve erro de propósito: assim a Meta
reenvia depois e a mensagem não se perde por uma falha momentânea do banco.

### O interesse agora pode ficar em branco

Quem escreve no WhatsApp ainda não disse o que quer. Chutar "aluguel" para todo
mundo sujaria o relatório de interesses, que é justamente um dos que você usa
para decidir.

O campo passou a ser opcional. No kanban, o card mostra **interesse a definir**
em laranja, e a atendente preenche na primeira conversa.

### Tipos de mensagem

Texto entra como está. Imagem, áudio, vídeo, documento, figurinha, localização e
contato entram identificados, como `[imagem]`, para a atendente saber que chegou
algo e abrir no WhatsApp. Receber o arquivo em si vem depois.

## v0.7.0 - HTTPS no domínio

O painel sai do endereço de IP e passa a atender em
**https://app.alfaiatariabrowns.com.br**, com certificado válido.

### Como ficou

- **Caddy** como proxy reverso, emitindo e renovando o certificado sozinho
- Certificado Let's Encrypt, válido até 8 de novembro de 2026
- Quem entrar por `http://` é redirecionado para `https://`
- O painel agora escuta apenas em `127.0.0.1:3000`. Sem isso, daria para
  acessar por `http://IP:3000` e contornar o certificado

### O cookie voltou a ser Secure

Na v0.3.3 o cookie de sessão teve que perder a marca `Secure`, porque o painel
era servido em `http://` e o navegador descartava. Com o `SERVER_URL` apontando
para `https://`, a proteção volta sozinha, exatamente como foi projetado.

Testado com um usuário descartável: login, navegação entre telas e recarga
completa da página, tudo mantendo a sessão. O usuário foi removido depois.

### Detalhe do DNS

O subdomínio já existia e apontava para a hospedagem antiga, em IPv4 e IPv6.
Os dois registros precisaram mudar. Deixar o `AAAA` para trás causa um problema
difícil de diagnosticar: metade dos acessos vai por IPv6, então o painel
funciona para umas pessoas e não para outras, sem padrão aparente.

## v0.6.2 - Marca no login

A tela de login mostrava a letra "B" provisória porque fica fora do painel e não
lia a configuração. Agora carrega a logo, as cores da Browns e o nome da loja,
tudo do banco, igual ao resto.

O título da aba também mudou, de "Painel Browns Alfaiataria" para
"Entrar · Browns Alfaiataria".

Trocar a logo em Configurações passa a valer também aqui.

### Uma proteção que veio junto

Como a tela agora consulta o banco, uma falha de conexão trocaria a porta de
entrada por uma tela de erro. Se a consulta falhar, ela cai nos valores padrão
da Browns e o formulário abre assim mesmo.

## v0.6.1 - Conexões com o banco

Corrige um problema sério de produção, descoberto ao ligar o agendamento.

### O que estava errado

O painel guardava a instância do banco apenas fora de produção. **Em produção,
cada acesso ao `db` criava um cliente novo, com um pool de conexões próprio.**

O sintoma custou a aparecer porque cada tela faz poucas operações. A
sincronização de marketing, que faz centenas seguidas, estourou o limite do
Postgres com `too many clients already`.

Agora a instância é guardada no módulo, uma por processo. O global continua
sendo usado só em desenvolvimento, onde o Next recarrega os módulos a cada
alteração.

Vale como aviso: era um vazamento silencioso, que ia degradar o painel
conforme o uso crescesse.

### Gravação em lotes

A sincronização gravava tudo numa transação única. Com milhares de comandos,
isso segura a conexão por muito tempo e arrisca estourar o tempo limite. Passou
a gravar em lotes de 200.

### Agendamento

Rota `/api/sincronizar`, protegida por chave própria em vez de sessão, porque
quem chama é o agendamento do servidor. A comparação da chave é de tempo
constante, para o tempo de resposta não entregar quantos caracteres estavam
certos.

## v0.6.0 - Marketing ao vivo

Os relatórios estão completos. As três fontes do Google leem direto da API, sem
depender do projeto antigo em PHP.

### O que foi aproveitado do brownsreport

O projeto antigo guardava o refresh token do Google Ads no banco dele. Isso
evitou uma autorização manual: as credenciais foram recuperadas de lá.

Também veio **mais de um ano de histórico**, importado para o banco do painel:

| Fonte | Período | Registros |
|---|---|---|
| Google Analytics | jun/2025 a ago/2026 | 1.716 |
| Google Ads | jun/2025 a ago/2026 | 1.568 |
| Search Console | jun/2026 a ago/2026 | 141 + 1.531 termos |

O relatório já nasce com profundidade, em vez de começar do zero.

### Leitura contínua

- **Google Analytics** e **Search Console** pela conta de serviço, sem
  participação de ninguém
- **Google Ads** pelo refresh token recuperado

Botão "Atualizar agora" no relatório, e o comando `npm run sincronizar:marketing`
para o agendamento no servidor.

A janela do Search Console termina três dias atrás de propósito: ele consolida
com atraso, e pedir "hoje" devolveria zero, sujando o gráfico.

Cada fonte sincroniza em sequência e falha isolada. Uma fonte fora do ar não
derruba as outras, e o relatório prefere dado parcial a tela de erro.

### As três telas de marketing

- **Origem dos leads**: cruza o campo Origem com o funil e mostra custo por lead
  e custo por venda
- **Google Ads**: investido, cliques, CTR, custo por clique, conversões e
  investimento mês a mês
- **Acessos ao site**: sessões, usuários, páginas, mais as buscas e páginas que
  trazem visita

### Duas fronteiras que quebraram o build

Coisas que TypeScript e lint não pegam, só `next build`:

- Uma tela de cliente importava o módulo de relatórios, que puxa o banco junto.
  O driver do Postgres foi parar no navegador. As listas de período e de abas
  viraram módulos neutros
- A página do servidor lia uma constante exportada de um módulo `'use client'`.
  De lá o servidor só enxerga referência de componente, não o dado

## v0.5.0 - Relatório comercial e identidade da marca

### Relatório comercial, com dados reais

Cinco abas, todas saindo do banco do painel, sem depender de integração
nenhuma. Filtro de período em 30 dias, 90 dias, 12 meses ou tudo.

- **Visão geral**: valor em negociação, faturamento, ticket médio e conversão,
  mais faturamento por mês do evento e recorte por interesse e ocasião
- **Conversão por etapa**: quantidade e valor parados em cada uma das nove etapas
- **Por interesse**: serviço, ocasião e origem do lead
- **Motivos de perda**: preço, estoque, prazo, concorrência, sem retorno
- **Por atendente**: atendimentos, ganhos, conversão e faturamento

Os gráficos são CSS puro. Uma biblioteca de gráficos aqui adicionaria centenas
de kilobytes ao navegador para desenhar retângulos proporcionais.

**A conversão considera só quem já terminou.** Quem ainda está no funil não
conta como perda, senão a taxa despencaria sem motivo real. A tela explica isso.

### Marketing: credenciais no lugar

Trouxe do projeto `brownsreport` as credenciais de Google Analytics 4, Search
Console e Google Ads. Ficam no `.env.local` e a chave da conta de serviço em
`segredos/`, ambos fora do Git.

A aba de Marketing mostra o que já está configurado e o que falta em cada fonte.
Ler os dados de verdade é o próximo passo: GA4 e Search Console usam conta de
serviço e saem sem sua participação; Google Ads precisa de uma autorização
única feita por você no navegador.

### Identidade da Browns

A marca saiu do provisório:

- Logo oficial em `public/marca/logo.svg`, no lugar da letra "B"
- Marrom `#4d322e` como cor principal
- Creme `#fae9db` como cor de fundo dos itens selecionados

O creme virou um campo próprio na configuração. Clarear o marrom por cálculo
dava um cinza morno, não o creme da marca.

Os comandos `npm run marca` e `npm run marca:producao` aplicam a paleta, e só
mexem se a cor ainda estiver no azul de fábrica.

## v0.4.1 - Três papéis

Entra o papel de **Gerente**, entre o administrador e o atendente.

| | Atendente | Gerente | Administrador |
|---|---|---|---|
| Conversas, funil, clientes, follow-ups | sim | sim | sim |
| Trocar a própria senha | sim | sim | sim |
| Relatórios | **não** | sim | sim |
| Criar, editar e excluir equipe | não | sim | sim |
| Integrações e dados da loja | não | não | sim |

### O atendente não vê relatórios

Some do menu, não fica cinza. E quem digitar o endereço direto encontra uma tela
explicando que a área não é do acesso dele.

Esconder do menu não é proteção: o menu vive no navegador. Cada rota confere o
papel de novo no servidor.

### O gerente não alcança administrador

Um gerente gerencia atendentes e outros gerentes. Não consegue editar, desativar
nem excluir um administrador, e a opção "Administrador" nem aparece na lista de
papéis que ele pode conceder.

Sem essa regra, bastaria um gerente se promover pela tela de equipe para virar
administrador, e a separação entre os dois papéis deixaria de existir. A trava
está na ação do servidor, não só na tela.

### Excluir membro

Além de desativar, agora dá para excluir de vez, com confirmação em dois passos.

Atendimentos, tarefas e mensagens da pessoa **continuam no sistema**: o vínculo é
desfeito, o histórico fica. O passado da loja não pode sumir porque alguém saiu
da equipe.

Continua valendo: ninguém mexe em si mesmo, e o último administrador ativo não
pode ser desativado, rebaixado nem excluído.

## v0.4.0 - Configurações

As Configurações eram uma tela de aviso, sem nada funcional. Agora são quatro
telas que salvam de verdade.

### Geral

- **Nome da loja**, que aparece na barra lateral e no título
- **Cor da marca**, com seletor visual. Aplica na hora em todo o painel: os três
  tons (cor, hover e fundo de item selecionado) são derivados de um valor só
- **Logo**, por enquanto pelo endereço da imagem. Envio de arquivo entra quando
  o painel tiver armazenamento próprio
- **Meu perfil** e **trocar minha senha**, disponíveis para qualquer usuário

Trocar a senha exige a senha atual. Sem isso, quem passasse pelo computador
destravado tomaria a conta.

### Equipe

Adicionar pessoas, alternar entre administrador e atendente, desativar e
reativar. Desativar tira a pessoa do sistema na hora, não no próximo login.

Duas travas: ninguém desativa ou rebaixa a si mesmo, e o último administrador
ativo não pode ser removido. Sem elas o painel ficaria sem ninguém capaz de
gerenciar equipe e integrações.

### Integrações

Campos para WhatsApp Cloud API e Bling.

As credenciais são **criptografadas com AES-256-GCM** antes de ir para o banco.
Um backup vazado não entrega o token do WhatsApp de quem o roubou. E nunca
voltam para a tela: o formulário mostra só os quatro últimos caracteres, e campo
em branco mantém o valor salvo.

Salvar credencial ainda não liga nada. É o primeiro passo, e a tela diz isso.

### Etapas do funil

Somente leitura, mostrando as nove etapas com seus checklists e follow-ups.

Editar exigiria migrar o funil do código para o banco, e um atendimento em
andamento não pode perder a etapa no meio do caminho. Ficou para uma versão
dedicada, e a tela explica isso em vez de fingir que funciona.

### Detalhe que só o build pega

Um arquivo com `'use server'` só pode exportar funções assíncronas. Eu exportava
também a lista de campos das integrações, e a página quebrava em branco.
TypeScript e lint passavam limpos: só `next build` acusa. Passou a fazer parte
da verificação antes de publicar.

## v0.3.4 - Sessão conferida no banco

Fecha uma brecha aparentada com a da v0.3.3.

O token de sessão vale 12 horas e carrega os dados do usuário dentro dele. Como
nada era conferido no banco a cada carregamento, apagar ou desativar uma pessoa
não a tirava do sistema: ela seguia navegando até o token expirar sozinho.

Agora o painel confirma a cada carregamento que o usuário ainda existe e está
ativo. Desativou, saiu na hora.

Custa uma consulta pequena por página, ao lado das que já existiam.

## v0.3.3 - Sessão que dura

Corrige o login que não se sustentava em produção: entrava, mostrava o painel, e
no primeiro clique voltava para a tela de login.

### A causa

O cookie de sessão era marcado como `Secure` sempre que `NODE_ENV` fosse
`production`. Dentro do container ele é, mas o painel é servido em `http://`
puro, sem certificado.

Cookie `Secure` só trafega em HTTPS. O navegador recebia e descartava.

Isso explica por que o login parecia funcionar: a primeira tela vem na mesma
resposta da ação de entrar, sem depender do cookie. A partir do segundo clique o
navegador precisa devolver o cookie, não tinha nenhum, e o middleware mandava de
volta para o login.

### A correção

A marca `Secure` agora depende do protocolo, não do ambiente. Sai de `SERVER_URL`:
começa com `https://` e o cookie é Secure; senão, não é.

Quando o domínio com HTTPS entrar, basta trocar `SERVER_URL` no `.env` do
servidor e a proteção volta sozinha.

## v0.3.2 - Números de verdade

Corrige algo que só apareceu com o painel em produção: a barra lateral mostrava
números inventados.

### O problema

Os contadores estavam cravados no código desde a época dos dados simulados. Numa
instalação nova e vazia, a lateral anunciava "Todas as conversas 8", "WhatsApp
6", "Ana 3", enquanto a lista ao lado dizia "Nenhuma conversa encontrada".

Em produção isso é pior do que não ter número: dá a entender que existem oito
conversas esperando resposta.

### O que mudou

Todos os contadores vêm do banco agora. Um contador zerado simplesmente não
aparece, para uma instalação nova não virar uma parede de zeros.

A lista de atendentes na lateral também é real: sai de quem tem conversa
atribuída, em vez de nomes fixos.

### Os filtros passaram a filtrar

Os links da lateral levavam a URLs que as telas ignoravam. Agora funcionam:

- **Chat**: minhas, não atribuídas, resolvidas, por canal e por atendente
- **Kanban**: meus, evento em até 7 dias, checklist incompleto, por interesse e
  por origem do lead
- **Follow-ups**: atrasadas, para hoje, concluídas
- **Clientes**: com atendimento aberto, cadastrados no mês

Os filtros rodam no servidor, pela URL. Isso deixa cada visão com endereço
próprio, que pode ser salvo nos favoritos ou mandado para outra pessoa.

## v0.3.1 - No ar

O painel sai da máquina de desenvolvimento e passa a rodar no VPS, em container,
ao lado do banco.

Endereço: `http://179.198.114.184:3000`

### Como ficou

- Imagem Docker em três estágios, usando a saída standalone do Next. A imagem
  final não carrega código-fonte nem dependências de desenvolvimento
- O container roda como usuário sem privilégio, não como root
- Banco de produção (`browns`) separado do de desenvolvimento (`browns_dev`),
  no mesmo Postgres
- Migrações não rodam sozinhas no deploy, de propósito: uma migração aplicada
  por engano pode apagar coluna com dado real dentro

### Sem usuário inicial em produção

O banco de produção subiu vazio, sem nenhum usuário. É proposital.

A senha do seed (`browns2026`) está escrita no repositório. Se ela existisse em
produção, qualquer pessoa com acesso ao código entraria no sistema.

O usuário é criado pelo comando `npm run usuario:producao`, que pergunta a senha
no terminal e grava só o hash. A senha não passa por arquivo nem pelo Git.

### Correções que o deploy revelou

- `prisma generate` exigia `DATABASE_URL` e quebrava a construção da imagem,
  onde banco nenhum existe
- O client do Prisma era criado ao importar o módulo, então `next build`
  quebrava ao analisar as páginas. Agora a conexão nasce no primeiro uso

## v0.3.0 - Banco e login

O painel para de esquecer. Nada mais é simulado: tudo que aparece na tela vem do
PostgreSQL, e tudo que você faz é gravado.

### Banco de dados

PostgreSQL 17 rodando no VPS, em container. Prisma 7 como ORM.

Duas bases separadas: `browns_dev` para desenvolvimento e `browns` para
produção. Rodar migração de desenvolvimento contra o banco de produção é como se
perde dado real sem querer.

O banco escuta apenas em `127.0.0.1` dentro do servidor, ou seja, não está
exposto na internet. Para desenvolver, sua máquina chega nele por um túnel SSH.

Tabelas: usuário, cliente, atendimento, tarefa, conversa e mensagem.

Dois detalhes que evitam problema mais adiante:

- Telefone do cliente é único, para o webhook do WhatsApp achar a pessoa pelo
  número em vez de criar um cadastro novo a cada mensagem
- Mensagem tem `idExterno` único, porque a Meta reenvia o mesmo evento com
  frequência e sem isso a conversa encheria de duplicatas

O checklist das etapas fica em JSON, não em colunas. Os campos variam por etapa,
então colunas fixas seriam dezenas quase sempre vazias.

### Login

Autenticação real, com senha guardada como hash bcrypt. A sessão é um JWT
assinado em cookie httpOnly, válido por 12 horas.

Proteção em duas camadas: o middleware barra quem não tem cookie, e o layout do
painel valida a assinatura no servidor, derrubando token forjado ou expirado.

E-mail inexistente e senha errada devolvem a mesma mensagem, de propósito. Dizer
qual dos dois falhou entrega para um atacante quais e-mails existem no sistema.

### O que agora é de verdade

- Arrastar card grava a etapa no banco. Recarregue a página: continua lá
- Trocar etapa pelo painel lateral também grava
- Responder no chat grava a mensagem com seu nome e atualiza a conversa
- Resolver conversa grava
- Concluir follow-up grava

Kanban e follow-ups usam atualização otimista: a tela responde na hora e o React
desfaz sozinho se a gravação falhar.

As mensagens são buscadas sob demanda ao abrir a conversa, não todas de uma vez.
Um histórico de anos de WhatsApp não caberia no carregamento da página.

### Correções

- O horário das conversas usava a data fixa da época dos dados simulados, então
  uma conversa de três dias atrás aparecia como se fosse de hoje

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
