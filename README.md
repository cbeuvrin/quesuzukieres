# ¿Qué Suzuki eres? · Quiz interactivo (local-first)

Quiz de 4 preguntas para evento Suzuki. El usuario se registra (nombre + correo) y descubre qué modelo conecta con su personalidad: **Swift BoosterGreen**, **Dzire BoosterGreen** o **Jimny 5 Puertas**.

## Cómo funciona

- **Modo por defecto: local.** Los registros se guardan en el **localStorage** del iPad. No requiere internet durante el evento.
- **PWA instalable.** Se agrega al home del iPad y abre en pantalla completa, como app nativa. Un Service Worker cachea todos los assets en el primer load.
- **Admin en el mismo iPad.** Abre `admin.html` desde una pestaña/bookmark del iPad para ver registros, estadísticas y exportar a CSV/JSON.
- **Opcional: Supabase.** Si configuras credenciales en `js/supabase-config.js`, además de guardar local, hace push remoto en background — útil si tienes WiFi confiable y quieres ver registros en una laptop en tiempo real.

## Estructura

```
.
├── index.html              ← Quiz (PWA principal)
├── admin.html              ← Panel local de registros
├── manifest.json           ← PWA manifest
├── service-worker.js       ← Cache offline
├── supabase-schema.sql     ← Sólo si usas Supabase
├── css/styles.css
├── css/admin.css
├── js/
│   ├── app.js              ← Flujo del quiz
│   ├── admin.js            ← Panel
│   ├── quiz-data.js        ← Preguntas + lógica de desempate
│   ├── storage.js          ← Local + push remoto opcional
│   └── supabase-config.js  ← OPCIONAL: pega tus credenciales
└── assets/
    ├── logo-suzuki.png
    ├── swift-booster-green-amarillo-ocaso.png
    ├── DZIRE-BOOSTERGREEN-2026.png
    └── JIMNY-5-DOOR-2026.png
```

---

## 1. Probar en local en tu Mac

```bash
# Desde la carpeta del proyecto
python3 -m http.server 8765
```

Abre [http://localhost:8765](http://localhost:8765) para el quiz, y [http://localhost:8765/admin.html](http://localhost:8765/admin.html) para el panel.

> El service worker sólo se registra desde un servidor (no funciona con `file://`).

---

## 2. Desplegar (3 opciones)

### A) GitHub Pages (recomendado, gratis)
```bash
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/suzuki-quiz.git
git push -u origin main
```
En GitHub → Settings → Pages → Source: `main` / root. Sale en `https://TU_USUARIO.github.io/suzuki-quiz/`.

### B) Netlify drop
Arrastra la carpeta a [https://app.netlify.com/drop](https://app.netlify.com/drop). Te da una URL pública en segundos.

### C) Servidor local en tu Mac durante el evento
Si NO quieres subir a internet:
```bash
python3 -m http.server 8765 --bind 0.0.0.0
```
Conecta el iPad a la misma red WiFi que tu Mac y abre `http://IP_DE_TU_MAC:8765` (la IP la ves en Ajustes → Red → WiFi → Detalles).

> **Importante**: para que la PWA funcione offline después de instalarla, **carga la app al menos una vez con conexión** — el Service Worker descarga y cachea todo. Después puedes desconectar el iPad sin problema.

---

## 3. Instalar como app en el iPad

1. Abre la URL en **Safari** del iPad (no Chrome).
2. Toca el botón de **Compartir** (cuadrado con flecha arriba) → **Agregar a pantalla de inicio**.
3. Listo: aparece un ícono en el home como app nativa. Al abrirla no se ve la barra del navegador.
4. **Carga una vez con WiFi** para que el Service Worker cachee todo. Después funciona 100% offline.
5. Repite para `admin.html` si quieres acceso rápido al panel desde el mismo iPad (sale como ícono separado).

### Modo "kiosco" recomendado
- Ajustes → Accesibilidad → **Acceso Guiado** → activa. En la app, triple-click al botón lateral para entrar a Acceso Guiado y bloquear que la modelo salga accidentalmente.
- Ajustes → No molestar / Modo Avión + WiFi.
- Brillo al máximo.

---

## 4. Durante el evento

1. La modelo abre la app desde el home del iPad. El usuario hace el quiz y se registra.
2. Cada registro se guarda en el iPad inmediatamente — **no necesita internet**.
3. Si tienes Supabase configurado y hay WiFi, también se sube en background. Si no hay WiFi, queda como "pendiente" y se sube cuando recuperes conexión (botón **Sincronizar** en el panel).
4. Cuando quieras ver los datos, abre `admin.html` en el iPad o en otra pestaña.

---

## 5. Al final del evento — exportar datos

1. Abre `admin.html` en el iPad.
2. Toca **Exportar CSV** o **Exportar JSON** → se descarga el archivo.
3. Compártelo por AirDrop, email o iCloud Drive a tu Mac.
4. Si tienes Supabase y registros pendientes, toca **Sincronizar** primero (con WiFi).
5. **Sólo cuando ya tengas el respaldo**, toca **Borrar todo** para limpiar el iPad y dejarlo listo para el próximo evento.

⚠️ **No borres los datos del sitio en Ajustes → Safari → Avanzado → Datos de sitios web**, eso elimina los registros del localStorage. La PWA mantiene sus datos siempre y cuando no la desinstales del home ni borres los datos manualmente.

---

## 6. Si quieres usar Supabase (opcional)

1. Crea cuenta en [https://supabase.com](https://supabase.com), nuevo proyecto.
2. En **SQL Editor** corre el contenido de `supabase-schema.sql`.
3. En **Project Settings → API**, copia `Project URL` y `anon public key`.
4. Pégalas en `js/supabase-config.js`.
5. La app sigue funcionando local-first; el remoto es un extra automático.

---

## Lógica del quiz

- 4 preguntas, 3 opciones cada una (A = Swift, B = Dzire, C = Jimny).
- Gana el modelo con más respuestas.
- Empates 2-2:
  - A + C → **Swift** (con espíritu aventurero)
  - B + C → **Jimny** (con versatilidad)
  - A + B → **Dzire** (más racional)

Editar preguntas o textos: `js/quiz-data.js`.

---

## Stack

HTML + CSS + JS puro, PWA con Service Worker, localStorage para persistencia. Supabase JS v2 opcional. Sin build step.
