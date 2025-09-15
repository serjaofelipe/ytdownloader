# Use uma imagem oficial do Node.js como base
FROM node:18-slim

# Instala as únicas duas dependências de sistema que precisamos: ffmpeg e yt-dlp
RUN apt-get update && apt-get install -y \
    ffmpeg \
    yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala APENAS as dependências do Node.js (agora sem o problemático yt-dlp-exec)
RUN npm install

# Copia o resto dos arquivos da sua aplicação
COPY . .

# Expõe a porta que sua aplicação usa
EXPOSE 3000

# O comando para iniciar sua aplicação
CMD [ "node", "server.js" ]