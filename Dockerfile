# Use uma imagem oficial do Node.js como base
FROM node:18-slim

# Instala o FFmpeg, Python e Git
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Cria um "apelido" para que o comando "python" aponte para "python3"
RUN ln -s /usr/bin/python3 /usr/bin/python

# Instala o yt-dlp globalmente usando a versão mais recente
RUN npm i -g yt-dlp

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências do Node.js
RUN npm install

# Copia o resto dos arquivos da sua aplicação
COPY . .

# Expõe a porta que sua aplicação usa
EXPOSE 3000

# O comando para iniciar sua aplicação
CMD [ "node", "server.js" ]