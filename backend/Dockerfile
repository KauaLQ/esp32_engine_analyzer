# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache ca-certificates openssl libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache ca-certificates openssl libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# (opcional) se você usa prisma client em runtime e quer garantir geração no build:
# ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
# RUN npx prisma generate

RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache ca-certificates openssl libc6-compat

# Ajuda em alguns ambientes com DNS/IPv6
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

# ✅ Encontra o main.js certo (dist/main.js ou dist/**/main.js)
# ✅ Se não achar, lista o conteúdo de dist pra debug
CMD ["sh", "-c", "\
  if [ -f dist/main.js ]; then MAIN='dist/main.js'; \
  else MAIN=$(find dist -maxdepth 5 -type f -name 'main.js' | head -n 1); fi; \
  echo \"[boot] Using entry: $MAIN\"; \
  if [ -z \"$MAIN\" ]; then \
    echo \"[boot] ERROR: main.js not found. dist tree:\"; \
    find dist -maxdepth 5 -type f -print; \
    exit 1; \
  fi; \
  npx prisma generate && npx prisma migrate deploy; \
  node \"$MAIN\" \
"]
