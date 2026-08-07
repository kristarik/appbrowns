# Histórico de versões

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
