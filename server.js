// server.js - Versão FINAL de Diagnóstico (Modo Detetive)
const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec');
const app = express();
const port = 3000;

app.use(cors());

app.get('/download', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL do vídeo não fornecida.' });
    }

    console.log(`--- INICIANDO PROCESSO DE DOWNLOAD PARA: ${videoUrl} ---`);

    const ytdlpProcess = ytdlp.exec(videoUrl, {
        'no-playlist': true,
        output: '-',
        format: 'bestvideo+bestaudio/best', // Formato padrão de alta qualidade
        // --- AQUI ESTÁ A MUDANÇA MAIS IMPORTANTE ---
        verbose: true, // Pede ao yt-dlp para imprimir TUDO que ele está fazendo
        // ------------------------------------------
    });

    res.header('Content-Disposition', `attachment; filename="video_final_test.mp4"`);

    ytdlpProcess.stdout.pipe(res);

    ytdlpProcess.stderr.on('data', (data) => {
        // Imprime todo o log de depuração no nosso terminal
        console.error(`[LOG YT-DLP]: ${data}`);
    });

    ytdlpProcess.on('error', (error) => {
        console.error(`[ERRO CRÍTICO]: Falha ao iniciar o processo yt-dlp: ${error.message}`);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Falha ao processar o vídeo.' });
        }
    });

    ytdlpProcess.on('close', (code) => {
        console.log(`--- PROCESSO FINALIZADO COM CÓDIGO: ${code} ---`);
    });
});

app.listen(port, () => {
    console.log(`Servidor de DIAGNÓSTICO rodando em http://localhost:${port}`);
});