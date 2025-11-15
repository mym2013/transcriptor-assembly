// helpers/assemblyai.js
// Transcribe un MP3 local con AssemblyAI: sube el archivo, crea el job y hace polling hasta completar.
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const AAI_BASE = 'https://api.assemblyai.com/v2';
const AAI_KEY = process.env.ASSEMBLYAI_API_KEY;

if (!AAI_KEY) {
    console.warn('[assemblyai] ASSEMBLYAI_API_KEY no definido en .env');
}

async function uploadFile(filePath) {
    const stat = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);

    const { data } = await axios({
        method: 'post',
        url: `${AAI_BASE}/upload`,
        headers: {
            authorization: AAI_KEY,
            'transfer-encoding': 'chunked',
            'content-type': 'application/octet-stream'
        },
        data: stream,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });

    // data es la URL de upload (audio_url para transcript)
    return data.upload_url || data; // SDK puede devolver { upload_url }
}

async function createTranscript(audioUrl) {
    const body = {
        audio_url: audioUrl,
        // Opcionales útiles:
        language_code: 'es',
        punctuate: true,
        format_text: true,
    };

    const { data } = await axios.post(`${AAI_BASE}/transcript`, body, {
        headers: { authorization: AAI_KEY }
    });
    return data.id;
}

async function waitForTranscript(id, timeoutMs = 15 * 60 * 1000, intervalMs = 3000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        const { data } = await axios.get(`${AAI_BASE}/transcript/${id}`, {
            headers: { authorization: AAI_KEY }
        });

        if (data.status === 'completed') return data.text;
        if (data.status === 'error') throw new Error(data.error || 'Transcripción fallida');

        await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('Timeout esperando transcripción de AssemblyAI');
}

async function transcribeMP3(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo no encontrado: ${filePath}`);
    }
    const audioUrl = await uploadFile(filePath);
    const id = await createTranscript(audioUrl);
    const text = await waitForTranscript(id);
    return (text || '').trim();
}

module.exports = { transcribeMP3 };
