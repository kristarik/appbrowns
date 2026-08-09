# Build em estagios: a imagem final nao carrega o codigo-fonte nem as
# dependencias de desenvolvimento, so o necessario para rodar.

FROM node:24-alpine AS dependencias
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS construcao
WORKDIR /app
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS producao
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S painel -u 1001

COPY --from=construcao /app/public ./public
COPY --from=construcao --chown=painel:nodejs /app/.next/standalone ./
COPY --from=construcao --chown=painel:nodejs /app/.next/static ./.next/static

# Necessarios para rodar migracao no start do container.
COPY --from=construcao /app/prisma ./prisma
COPY --from=construcao /app/prisma.config.ts ./prisma.config.ts
COPY --from=construcao /app/node_modules/prisma ./node_modules/prisma
COPY --from=construcao /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=construcao /app/node_modules/dotenv ./node_modules/dotenv

USER painel
EXPOSE 3000

CMD ["node", "server.js"]
