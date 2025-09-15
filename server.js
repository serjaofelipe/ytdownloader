// server.js - Versão FINAL Multiplataforma
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs'); // Módulo para verificar se arquivos existem

const app = express();
const port = 3000;

app.use(cors());

app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL do vídeo não fornecida.' });
    }

    console.log(`Iniciando download para: ${videoUrl}`);

    try {
        // --- LÓGICA INTELIGENTE PARA SELECIONAR COOKIES ---
        const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
        const isInstagram = videoUrl.includes('instagram.com');

        let cookieFile = '';
        if (isYouTube) {
            cookieFile = 'cookies.txt';
        } else if (isInstagram) {
            cookieFile = 'instagram_cookies.txt';
        }
        // --------------------------------------------------

        const titleArgs = ['--get-title', videoUrl];

        // Adiciona o argumento de cookie somente se o arquivo apropriado existir
        if (cookieFile && fs.existsSync(cookieFile)) {
            console.log(`Usando o arquivo de cookies: ${cookieFile}`);
            titleArgs.push('--cookies', cookieFile);
        } else if (cookieFile) {
            console.warn(`AVISO: A URL parece ser do ${isInstagram ? 'Instagram' : 'YouTube'}, mas o arquivo ${cookieFile} não foi encontrado.`);
        }

        const infoProcess = spawn('yt-dlp', titleArgs);

        const titleChunks = [];
        for await (const chunk of infoProcess.stdout) {
            titleChunks.push(chunk);
        }
        const rawTitle = Buffer.concat(titleChunks).toString().trim();
        const sanitizedTitle = rawTitle.replace(/[<>:"/\\|?*]/g, '_').replace(/[^\x20-\x7E]/g, '');

        if (!sanitizedTitle) {
            throw new Error('Não foi possível obter o título do vídeo. A URL pode ser inválida ou o conteúdo requer login.');
        }

        res.header('Content-Disposition', `attachment; filename="${sanitizedTitle || 'video'}.mp4"`);

        const downloadArgs = [
            videoUrl,
            '--no-playlist',
            '--merge-output-format', 'mp4',
            '-f', 'bestvideo[vcodec^=avc][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
            '-o', '-',
        ];

        if (cookieFile && fs.existsSync(cookieFile)) {
            downloadArgs.splice(2, 0, '--cookies', cookieFile); // Insere os cookies na posição correta
        }

        const ytdlpProcess = spawn('yt-dlp', downloadArgs);

        ytdlpProcess.stdout.pipe(res);

        ytdlpProcess.stderr.on('data', (data) => {
            console.error(`Log do yt-dlp: ${data.toString()}`);
        });

        ytdlpProcess.on('close', (code) => {
            console.log(`Processo finalizado com código ${code}`);
            if (!res.writableEnded) {
                res.end();
            }
        });

        ytdlpProcess.on('error', (err) => {
            console.error(`[ERRO NO SPAWN] Falha ao iniciar o processo: ${err.message}`);
            if (!res.headersSent) {
                res.status(500).send({ error: 'Falha ao iniciar o processo de download.' });
            }
        });

    } catch (error) {
        console.error("Erro ao processar o vídeo:", error.message);
        if (!res.headersSent) {
            res.status(500).send({ error: error.message || 'Falha ao processar o vídeo.' });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor FINAL rodando na porta ${PORT}`);
});