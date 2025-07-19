'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [transcripcion, setTranscripcion] = useState('');
  const [resumen, setResumen] = useState('');
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoResumen, setCargandoResumen] = useState(false);

  const manejarTranscripcion = async () => {
    setError('');
    setTranscripcion('');
    setResumen('');

    if (!url) {
      setError('Por favor ingresa una URL.');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('https://transcriptor-rail.up.railway.app/transcribir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-key': 'clave-gonzalo-2025'
        },
        body: JSON.stringify({ url, usarCookies: true })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la transcripción.');
      }

      const data = await response.json();
      setTranscripcion(data.transcripcion);
      setHistorial(([url, ...historial]).slice(0, 5));
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const generarResumen = async () => {
    if (!transcripcion) {
      setError('No hay transcripción para resumir.');
      return;
    }

    setError('');
    setResumen('');
    setCargandoResumen(true);

    try {
      const response = await fetch('https://transcriptor-rail.up.railway.app/resumir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-key': 'clave-gonzalo-2025'
        },
        body: JSON.stringify({ texto: transcripcion })
      });

      if (!response.ok) {
        throw new Error('Error al generar el resumen.');
      }

      const data = await response.json();
      setResumen(data.resumen);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoResumen(false);
    }
  };

  const borrarURL = () => {
    setUrl('');
    setTranscripcion('');
    setResumen('');
    setError('');
  };

  const descargarTXT = (contenido, nombreArchivo) => {
    if (!contenido) return;

    const blob = new Blob([contenido], { type: 'text/plain' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  };

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Transcriptor de YouTube</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Pega la URL de YouTube"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={manejarTranscripcion}
          disabled={cargando}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {cargando ? 'Procesando...' : 'Transcribir'}
        </button>
        <button
          onClick={borrarURL}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Borrar URL
        </button>
      </div>

      {error && (
        <p className="text-red-600 mb-4">⚠️ {error}</p>
      )}

      {transcripcion && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Transcripción:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{transcripcion}</pre>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => descargarTXT(transcripcion, 'transcripcion.txt')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Descargar Transcripción
            </button>
            <button
              onClick={generarResumen}
              disabled={cargandoResumen}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              {cargandoResumen ? 'Resumiendo...' : 'Generar Resumen Ejecutivo'}
            </button>
          </div>
        </div>
      )}

      {resumen && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Resumen Ejecutivo:</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">{resumen}</pre>
          <button
            onClick={() => descargarTXT(resumen, 'resumen_ejecutivo.txt')}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            Descargar Resumen
          </button>
        </div>
      )}

      {historial.length > 0 && (
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Historial reciente:</h2>
          <ul className="list-decimal pl-5 space-y-1">
            {historial.map((item, index) => (
              <li key={index}>
                <a href={item} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}



