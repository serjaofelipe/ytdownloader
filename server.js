// server.js - Versão FINAL para Docker
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process'); // Módulo nativo do Node.js para rodar comandos

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
        // Pega as informações do vídeo (como o título) usando yt-dlp
        const infoProcess = spawn('yt-dlp', ['--get-title', videoUrl]);
        let videoTitle = 'video'; // Título padrão

        // 'await' para o processo terminar e pegarmos o título
        for await (const chunk of infoProcess.stdout) {
            videoTitle = chunk.toString().trim().replace(/[<>:"/\\|?*]/g, '_');
        }

        // Configura o cabeçalho para o download com o título correto
        res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);

        // Inicia o processo de download do vídeo
        const ytdlpProcess = spawn('yt-dlp', [
            videoUrl,
            '--no-playlist',
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '-o', '-',
        ]);

        // Envia o fluxo do vídeo diretamente para o navegador
        ytdlpProcess.stdout.pipe(res);

        // Monitora por erros
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

// A Render usa a variável de ambiente PORT. Se não estiver definida, usamos 3000.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor FINAL rodando na porta ${PORT}`);
});