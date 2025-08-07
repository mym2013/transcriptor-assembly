// server.js corregido para producción en Railway
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/', (req, res) => {
  res.send('Servidor backend activo ✅');
});

app.post('/transcribir', async (req, res) => {
  const videoURL = req.body.url;
  const accessKey = req.body.key;

  if (!videoURL || accessKey !== process.env.ACCESS_KEY) {
    return res.status(401).json({ error: 'URL o clave inválida' });
  }

  const outputPath = path.join(__dirname, 'audio.mp3');
  const txtPath = path.join(__dirname, 'transcripcion.txt');

  try {
    // Descargar audio
    await new Promise((resolve, reject) => {
      const proceso = spawn('yt-dlp', [
        '-x', '--audio-format', 'mp3',
        '-o', outputPath,
        videoURL
      ]);

      proceso.stderr.on('data', data => console.error(`yt-dlp error: ${data}`));
      proceso.on('close', code => code === 0 ? resolve() : reject(`yt-dlp falló con código ${code}`));
    });

    // Transcribir
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: 'whisper-1',
    });

    const texto = transcription.text;
    fs.writeFileSync(txtPath, texto);

    res.json({ transcripcion: texto });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error en la transcripción' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
