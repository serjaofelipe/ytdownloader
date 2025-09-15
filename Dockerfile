# Use uma imagem oficial do Node.js como base
FROM node:18-slim

# Instala ffmpeg e as ferramentas necessárias para baixar o yt-dlp (curl)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Baixa a versão mais recente do yt-dlp direto do GitHub e a torna executável
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Copia o arquivo de cookies
COPY cookies.txt ./

# Instala as dependências do Node.js
RUN npm install

# Copia o resto dos arquivos
COPY . .

# Expõe a porta
EXPOSE 3000

# O comando para iniciar
CMD [ "node", "server.js" ]