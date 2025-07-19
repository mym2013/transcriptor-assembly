// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/transcribir', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL no proporcionada' });

  const ytdlp = spawn('yt-dlp', [
    url,
    '--extract-audio',
    '--audio-format', 'mp3',
    '-o', 'audio.mp3',
    '--force-overwrites'
  ]);

  ytdlp.stdout.on('data', data => console.log(`yt-dlp stdout: ${data}`));
  ytdlp.stderr.on('data', data => console.error(`yt-dlp stderr: ${data}`));

  ytdlp.on('close', async (code) => {
    if (code !== 0) return res.status(500).json({ error: 'Error al descargar audio' });

    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(path.join(__dirname, 'audio.mp3')),
        model: 'whisper-1',
        response_format: 'text'
      });

      fs.writeFileSync('transcripcion.txt', transcription);
      res.json({ transcripcion: transcription });

    } catch (err) {
      console.error('Error en transcripción:', err);
      res.status(500).json({ error: 'Fallo al transcribir' });
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
