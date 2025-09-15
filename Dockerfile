# Use uma imagem oficial do Node.js como base
FROM node:18-slim

# Instala o FFmpeg, Python e o gerenciador de pacotes do Python (pip)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Cria um "apelido" para que o comando "python" aponte para "python3"
RUN ln -s /usr/bin/python3 /usr/bin/python

# Instala/Atualiza o yt-dlp usando o pip
RUN pip3 install --upgrade yt-dlp

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências do Node.js (agora o yt-dlp-exec funcionará)
RUN npm install

# Copia o resto dos arquivos da sua aplicação
COPY . .

# Expõe a porta que sua aplicação usa
EXPOSE 3000

# O comando para iniciar sua aplicação
CMD [ "node", "server.js" ]