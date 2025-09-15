# Use uma imagem oficial do Node.js como base
FROM node:18-slim

# Instala o FFmpeg e outras dependências necessárias
RUN apt-get update && apt-get install -y \
    ffmpeg \
    # Limpa o cache para manter a imagem pequena
    && rm -rf /var/lib/apt/lists/*

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