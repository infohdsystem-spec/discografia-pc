# Discografía v8.0.0 — Stable Release 🎉

Colección profesional de CDs — SPA autocontenida con multi-colección, Service Worker offline, i18n (es/en/pt), etiquetas, QR, filtros guardados y command palette.

**Autor:** HDSystem IT · **Tel:** +54 9 11 4563-0851

---

## ⚠️ IMPORTANTE: cómo ejecutar la app

La app **NO debe abrirse con doble clic** en `index.html`. Hay que servirla desde un servidor local por estas razones:

1. **CORS:** el navegador bloquea las peticiones a Discogs, Last.fm y otras APIs cuando el origen es `file://` (origin null).
2. **IndexedDB:** la cuota de almacenamiento es mucho mayor cuando se sirve por HTTP.
3. **Service Worker:** **solo funciona desde HTTP/HTTPS**, no desde `file://`.

### 🚀 Windows

Doble clic en **`INICIAR.bat`**. Requiere Python o Node instalado (el script detecta automáticamente).

### 🐧 Linux / 🍎 Mac

```bash
chmod +x INICIAR.sh
./INICIAR.sh