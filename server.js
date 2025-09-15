// server.js - Versão FINAL com formato de saída corrigido
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
        let videoTitle = 'video';

        for await (const chunk of infoProcess.stdout) {
            videoTitle = chunk.toString().trim().replace(/[<>:"/\\|?*]/g, '_');
        }

        res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);

        const ytdlpProcess = spawn('yt-dlp', [
            videoUrl,
            '--no-playlist',
            '--cookies', 'cookies.txt',
            '--merge-output-format', 'mp4', // <== A SOLUÇÃO ESTÁ AQUI
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
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