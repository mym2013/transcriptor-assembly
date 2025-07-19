# Transcriptor App 🎙️

Aplicación web completa que permite transcribir automáticamente el audio de un video de YouTube utilizando la API de OpenAI Whisper.

---

## 🚀 Funcionalidades

- ✅ Ingreso de URL de YouTube
- ✅ Descarga automática del audio en formato MP3 (via yt-dlp)
- ✅ Transcripción automática del audio con OpenAI Whisper
- ✅ Visualización directa del texto transcripto en la interfaz
- ✅ Botón para borrar la URL y limpiar estados
- ✅ Descarga del archivo `.txt` con la transcripción
- ✅ Estructura profesional con frontend y backend separados

---

## 🧠 Tecnologías utilizadas

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Node.js, Express, OpenAI API, yt-dlp
- **Control de versiones**: Git + GitHub
- **Estrategia de ramas**: `main` para producción y `frontend-mejoras` para desarrollo

---

## 🛠️ Instrucciones de instalación (entorno local)

1. Clonar el repositorio:
```bash
git clone https://github.com/mym2013/transcriptor-app.git
```

2. Instalar dependencias:
```bash
cd transcriptor-frontend
npm install

cd ../transcriptor-backend
npm install
```

3. Agregar `.env` con la API KEY de OpenAI en la carpeta `transcriptor-backend`:
```
OPENAI_API_KEY=tu_clave_secreta
```

4. Iniciar los servidores:
```bash
# En transcriptor-backend
node server.js

# En transcriptor-frontend
npm run dev
```

5. Acceder a la app:
```
http://localhost:3000
```

---

## 📸 Captura de pantalla

*(Agregar imagen aquí si se desea)*

---

## 👨‍💻 Desarrollado por

**Gonzalo**  
Desarrollador fullstack por pasión y proyecto propio.  
Manejo profesional de ramas, Git, depuración y arquitectura técnica modular.

---

## 📄 Licencia

Este proyecto es privado. Para uso personal o educativo.
