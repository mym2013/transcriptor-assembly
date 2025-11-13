/**
 * check-env.js
 * Verifica que las dependencias externas ffmpeg y yt-dlp estén instaladas.
 * Cap 2 — Proyecto transcriptor-assembly
 */

import { execSync } from "child_process";

const tools = ["ffmpeg", "yt-dlp"];

function checkTool(tool) {
    try {
        const versionFlag = tool === "yt-dlp" ? "--version" : "-version";
        const version = execSync(`${tool} ${versionFlag}`, { encoding: "utf8" });
        console.log(`✅ ${tool} detectado`);
        console.log(version.split("\n")[0]);
    } catch {
        console.error(`❌ ${tool} no encontrado en PATH.`);
        process.exitCode = 1;
    }
}

console.log("🔍 Verificando herramientas externas...\n");
tools.forEach(checkTool);
console.log("\nVerificación completada.");
