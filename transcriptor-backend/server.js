// Cargar variables de entorno
require('dotenv').config();

// Helpers y dependencias principales
const { transcribeMP3 } = require('./helpers/assemblyai');
const express = require('express');
const cors = require('cors'); // disponible si luego quieres usar app.use(cors());
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const sqlite3 = require('better-sqlite3');

// Rutas de autenticación
const authRoutes = require('./auth/auth.routes');

// ===============================
// 🔹 Inicializar base de datos
// ===============================
const db = new sqlite3('transcripciones.sqlite');
db.exec(`
  CREATE TABLE IF NOT EXISTS transcripciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    texto TEXT,
    fecha TEXT
  )
`);

// ===============================
// 🔹 Inicializar Express
// ===============================
const app = express();

// CORS básico + preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-access-key'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Body parser JSON
app.use(express.json());

// Validación de clave de acceso
app.use((req, res, next) => {
  const userKey = req.headers['x-access-key'];
  console.log('🧪 userKey:', userKey, '| ENV ACCESS_KEY:', process.env.ACCESS_KEY);
  if (userKey !== process.env.ACCESS_KEY) {
    return res.status(401).json({ error: 'Clave de acceso no válida' });
  }
  next();
});

// ===============================
// 🔹 Rutas de autenticación
// ===============================
app.use('/api/auth', authRoutes);

/**
 * ==============================
 * 🔹 Endpoint para Transcripción
 * ==============================
 */
app.post('/transcribir', async (req, res) => {
  const { url, usarCookies } = req.body;
  if (!url) return res.status(400).json({ error: 'URL no proporcionada' });

  const audioPath = path.join(__dirname, 'audio.mp3');
  console.log('✅ Descargando audio con yt-dlp...');

  const ytdlpArgs = [
    url,
    '--extract-audio',
    '--audio-format', 'mp3',
    '--force-overwrites',
    '--no-cache-dir',
    '-o', 'audio.mp3'
  ];

  if (usarCookies) {
    // cookies.txt debe existir en el directorio backend
    ytdlpArgs.splice(1, 0, '--cookies', 'cookies.txt');
  }

  const ytdlp = spawn('yt-dlp', ytdlpArgs);
  ytdlp.stdout.on('data', d => console.log(`yt-dlp stdout: ${d}`));
  ytdlp.stderr.on('data', d => console.error(`yt-dlp stderr: ${d}`));

  ytdlp.on('close', async code => {
    if (code !== 0) {
      console.error(`yt-dlp terminó con código ${code}`);
      return res.status(500).json({ error: 'Error al descargar audio' });
    }

    try {
      console.log('✅ Audio descargado correctamente.');
      const stats = fs.statSync(audioPath);

      let fullText = '';

      if (stats.size > 25 * 1024 * 1024) {
        console.warn('⚠️ Audio > 25MB. Dividiendo con FFmpeg en ~300s...');
        const tempDir = path.join(require('os').tmpdir(), 'chunks');
        fs.mkdirSync(tempDir, { recursive: true });

        const segmentCmd = [
          '-i', audioPath,
          '-f', 'segment',
          '-segment_time', '300',
          '-c', 'copy',
          path.join(tempDir, 'chunk_%03d.mp3')
        ];

        await new Promise((resolve, reject) => {
          const ff = spawn('ffmpeg', segmentCmd);
          ff.stderr.on('data', d => console.log(`ffmpeg: ${d}`));
          ff.on('close', c => (c === 0 ? resolve() : reject(new Error(`ffmpeg code ${c}`))));
        });

        // Ordenar para mantener secuencia correcta
        const files = fs
          .readdirSync(tempDir)
          .filter(f => f.endsWith('.mp3'))
          .sort((a, b) => a.localeCompare(b));

        for (const file of files) {
          const chunkPath = path.join(tempDir, file);
          console.log(`🔹 Transcribiendo fragmento: ${file}`);
          const t = await transcribeMP3(chunkPath); // ✅ AssemblyAI
          fullText += (t || '') + '\n';
        }
      } else {
        console.log('✅ Transcribiendo audio completo con AssemblyAI...');
        fullText = await transcribeMP3(audioPath); // ✅ AssemblyAI
      }

      fullText = (fullText || '').trim();
      fs.writeFileSync('transcripcion.txt', fullText);

      db.prepare('INSERT INTO transcripciones (url, texto, fecha) VALUES (?, ?, ?)').run(
        url,
        fullText,
        new Date().toISOString()
      );

      return res.json({ transcripcion: fullText });
    } catch (err) {
      console.error('Error al transcribir:', err);
      return res.status(500).json({ error: 'Error al transcribir el audio' });
    }
  });
});

/**
 * ===========================
 * 🔹 Endpoint para Resumir
 * ===========================
 * (Deshabilitado temporalmente en esta versión)
 */
app.post('/resumir', (_req, res) => {
  return res.status(200).json({
    resumen: '📝 Resumen deshabilitado temporalmente en la versión AssemblyAI.'
  });
});

/**
 * ===========================
 * 🔹 Iniciar Servidor
 * ===========================
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
