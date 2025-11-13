# Transcriptor Assembly — Clon (MVP)

## 🎯 Objetivo
Dejar la base del repositorio lista para desarrollo con **AssemblyAI**: estructura mínima, `README`, `.gitignore`, `.env.example` y verificación local de `ffmpeg` / `yt-dlp`.

---

## 🧭 Flujo de ramas
- **main** → rama estable (solo merges vía PR revisados).
- **dev2** → rama de desarrollo activa para el Capítulo 1.

> Cualquier cambio nuevo parte desde `dev2` y se fusiona mediante Pull Request (PR) hacia `main`.

---

## ⚙️ Requisitos locales
Asegúrate de tener instalados:

- **Node.js** (versión LTS)
- **ffmpeg** incluido en el `PATH` → prueba con:
  ```bash
  ffmpeg -version
