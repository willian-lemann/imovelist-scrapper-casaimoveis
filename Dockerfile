FROM node:20-alpine

WORKDIR /app

# Instale o pnpm globalmente
RUN npm install -g pnpm

# Copie os arquivos de dependências
COPY package.json pnpm-lock.yaml* ./

# Instale as dependências com pnpm
RUN pnpm install --frozen-lockfile

# Copie o restante do código
COPY . .

# Instale as dependências do Chromium para o Puppeteer funcionar no ambiente Alpine
RUN apk add --no-cache \
   chromium \
   nss \
   freetype \
   harfbuzz \
   ca-certificates \
   ttf-freefont


ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set environment variables
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG DATABASE_URL

ENV SUPABASE_URL=${SUPABASE_URL}
ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV DATABASE_URL=${DATABASE_URL}

# EXPOSE 3000 # Descomente se seu app for web


CMD ["pnpm", "start"]