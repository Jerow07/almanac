# Almanac 💖 - Jerónimo & Zahria

> Nuestro almanaque y organizador colaborativo para planificar el mes, la semana y el año juntos sin olvidar ningún compromiso ni detalle.

![Almanac Preview](public/calendar-heart.svg)

---

## ✨ Características Principales

- **Diseñado para Pareja**:
  - Tareas asignadas visualmente a **Jerónimo** 👨🏻‍💻 (acento azul), **Zahria** 👩🏻‍🎨 (acento rosa) o **Ambos / Juntos** 💑 (acento violeta/degradado).
  - Filtros rápidos en un clic para ver *"Todo"*, *"Solo de Jerónimo"*, *"Solo de Zahria"* o *"Juntos"*.
  - Categorías temáticas con código de color: *Cita/Pareja ❤️, Hogar 🏠, Compras 🛒, Finanzas 💳, Salud 🩺, Viajes ✈️, Trabajo 💼, Recordatorio 📌*.

- **4 Vistas Completas de Calendario**:
  - 📅 **Mes**: Grilla clásica interactiva con navegación rápida y selector de días.
  - 📆 **Semana**: Desglose por columnas de lunes a domingo para organizar el día a día.
  - 🌟 **Año**: Visión panorámica de los 12 meses con mapas de calor y puntos de actividad para aniversarios y vacaciones.
  - 📋 **Agenda / Hoy**: Lista organizada cronológicamente en *Atrasadas*, *Para Hoy*, *Mañana*, *Próximos días* y *Completadas*.

- **Sonidos Agradables & Micro-interacciones (Web Audio API)**:
  - 🔔 *Campanita mágica y armónica* al completar tareas junto con lluvia de confeti pastel.
  - 🫧 *Pop suave* al crear o editar compromisos.
  - 🔊 Botón en la barra superior para silenciar o activar los sonidos en cualquier momento.

- **Sistema de Notificaciones & Recordatorios**:
  - Compatible con la **Web Notification API** nativa de navegadores móviles y de escritorio.
  - Avisos programables: *Al momento, 15 minutos antes, 1 hora antes o 1 día antes*.
  - Centro de notificaciones interno con campana y conteo de alertas pendientes.

- **Persistencia & Respaldos**:
  - Almacenamiento local automático y offline en `localStorage`.
  - Herramienta para **Descargar Respaldo JSON** y **Restaurar** desde cualquier dispositivo.
  - Preparado para sincronización en la nube con **Supabase** (opcional añadiendo las claves en `.env`).

- **Listo para Vercel & PWA Mobile**:
  - Interfaz responsiva pensada para usarse como aplicación web en smartphones (iOS Safari y Android Chrome: *"Añadir a la pantalla de inicio"*).
  - Configuración `vercel.json` incluida para despliegue directo con un clic.

---

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Vite 6** (Carga ultrarrápida)
- **Tailwind CSS 3** (Estética suave, bordes redondeados y paleta acogedora)
- **Lucide Icons** (Iconografía moderna)
- **Date-fns** (Manejo preciso de fechas y semanas en español)
- **Web Audio API** (Sintetizador de sonido nativo sin dependencias externas)
- **Canvas-Confetti** (Animaciones de celebración)

---

## 🚀 Puesta en Marcha Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

4. Compilar para producción:
   ```bash
   npm run build
   ```

---

## 🌐 Despliegue en Vercel

1. Sube este repositorio a tu cuenta de GitHub:
   ```bash
   git add .
   git commit -m "feat: Almanac - Calendario y organizador para Jerónimo y Zahria"
   git branch -M main
   git push -u origin main
   ```
2. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
3. Haz clic en **"Add New..."** -> **"Project"** y selecciona tu repositorio `almanac`.
4. Deja la configuración de framework por defecto (**Vite**) y presiona **Deploy**.
5. ¡Listo! Vercel te entregará una URL HTTPS (por ejemplo `https://almanac-jerow07.vercel.app`) para que tú y Zahria puedan abrirla desde sus teléfonos y computadoras.
