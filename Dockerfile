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

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# EXPOSE 3000 # Descomente se seu app for web

CMD ["pnpm", "start"]