# Use uma imagem oficial do Node.js como base
FROM node:18-slim

# Instala TODAS as nossas dependências
RUN apt-get update && apt-get install -y \
    ffmpeg \
    yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# ==> NOVA LINHA AQUI <==
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