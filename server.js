// server.js - Versão FINAL com Captura de Título Corrigida
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

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
        const infoProcess = spawn('yt-dlp', ['--get-title', videoUrl, '--cookies', 'cookies.txt']);

        // --- A CORREÇÃO ESTÁ AQUI ---
        // Junta todos os "pedaços" do título antes de processar
        const titleChunks = [];
        for await (const chunk of infoProcess.stdout) {
            titleChunks.push(chunk);
        }
        const rawTitle = Buffer.concat(titleChunks).toString().trim();

        // Limpa (sanitiza) o título completo para ser um nome de arquivo seguro
        const sanitizedTitle = rawTitle.replace(/[<>:"/\\|?*]/g, '_').replace(/[^\x20-\x7E]/g, '');
        // -----------------------------

        res.header('Content-Disposition', `attachment; filename="${sanitizedTitle || 'video'}.mp4"`);

        const ytdlpProcess = spawn('yt-dlp', [
            videoUrl,
            '--no-playlist',
            '--cookies', 'cookies.txt',
            '--merge-output-format', 'mp4',
            '-f', 'bestvideo[vcodec^=avc][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
            '-o', '-',
        ]);

        ytdlpProcess.stdout.pipe(res);

        ytdlpProcess.stderr.on('data', (data) => {
            console.error(`Log do yt-dlp: ${data}`);
        });

        ytdlpProcess.on('close', (code) => {
            console.log(`Processo finalizado com código ${code}`);
            if (!res.writableEnded) {
                res.end();
            }
        });

    } catch (error) {
        console.error("Erro ao processar o vídeo:", error);
        if (!res.headersSent) {
            res.status(500).send({ error: 'Falha ao processar o vídeo.' });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor FINAL rodando na porta ${PORT}`);
});