# Deploy

O painel roda no VPS em container, junto do Postgres.

- Servidor: `179.198.114.184`
- Pasta: `/opt/browns/painel`
- Configuração: `/opt/browns/painel/deploy/.env`

O arquivo `.env` do servidor guarda a senha do banco e o `AUTH_SECRET`. Ele
nunca vai para o Git.

## Publicar uma versão nova

Entre no servidor:

```bash
ssh root@179.198.114.184
```

Puxe o código e suba:

```bash
cd /opt/browns/painel && git pull && cd deploy && docker compose up -d --build
```

O `--build` reconstrói a imagem. Sem ele o container sobe com o código antigo.

## Migrações do banco

Não rodam sozinhas no deploy, de propósito: uma migração aplicada por engano
pode apagar coluna com dado real dentro.

Rode da sua máquina, com o túnel aberto:

```bash
npm run tunel
```

Depois, apontando para o banco de produção:

```bash
npx dotenv -e .env.local -- cross-env DATABASE_URL=$DATABASE_URL_PRODUCAO npx prisma migrate deploy
```

Faça backup antes de qualquer migração que remova ou renomeie coluna.

## Criar ou trocar senha de usuário

Com o túnel aberto, na sua máquina:

```bash
npm run usuario:producao
```

Ele pergunta e-mail, nome e senha. A senha é digitada no seu terminal e vira
hash antes de tocar no banco. Nunca aparece em arquivo nem no Git.

## Ver o que está acontecendo

Status dos containers:

```bash
cd /opt/browns/painel/deploy && docker compose ps
```

Logs do painel:

```bash
cd /opt/browns/painel/deploy && docker compose logs -f painel
```

## Backup do banco

Manual:

```bash
cd /opt/browns/painel/deploy && docker compose exec -T db pg_dump -U browns browns > ~/backup-$(date +%F).sql
```

Diário às 3h, via `crontab -e`:

```
0 3 * * * cd /opt/browns/painel/deploy && docker compose exec -T db pg_dump -U browns browns > /root/backup-$(date +\%F).sql
```

Backup no próprio servidor protege contra erro humano, não contra perda do
servidor. Vale copiar para fora periodicamente.

## Restaurar

```bash
cd /opt/browns/painel/deploy && docker compose exec -T db psql -U browns browns < ~/backup-2026-08-09.sql
```

## Pendente

- HTTPS com subdomínio, via Caddy como proxy reverso
- Enquanto o acesso for por `http://IP:3000`, o tráfego não é criptografado e
  alguns recursos do navegador ficam indisponíveis
