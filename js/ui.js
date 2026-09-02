/* ui.js — utilidades de interfaz compartidas: plantillas HTML, toasts, modales,
   iconos y formateo. Sin dependencias externas. */
(function (g) {
  'use strict';

  /* Escapa texto para insertarlo en HTML */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Etiqueta de plantilla: html`<p>${valor}</p>` escapa cada interpolación.
     Para insertar HTML ya construido, envuélvelo con raw(). */
  function html(strings) {
    let out = strings[0];
    for (let i = 1; i < arguments.length; i++) {
      const v = arguments[i];
      out += (v && v.__raw ? v.value : Array.isArray(v) ? v.join('') : esc(v)) + strings[i];
    }
    return out;
  }
  function raw(value) { return { __raw: true, value: value == null ? '' : value }; }

  const ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 4h4v16H7zM13 4h4v16h-4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 5l4 4"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><path d="M8 8h11v11H8zM5 16V5h11"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 5v13M6 13l6 6 6-6"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V6M6 11l6-6 6 6"/></svg>',
    timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M6 21V4h12l-2.5 4L18 12H6"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24"><path d="M4 8v8M8 6v12M16 6v12M20 8v8M8 12h8"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10.5 9.5l5 2.5-5 2.5z"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 15V3M8 7l4-4 4 4M4 14v5a2 2 0 002 2h12a2 2 0 002-2v-5"/></svg>'
  };
  function icon(n) { return ICON[n] || ''; }

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 2200);
  }

  /* ---------- modal ---------- */
  function modal(contentHTML, onMount) {
    const box = document.getElementById('modal');
    box.innerHTML = '<div class="modal-box"><div class="modal-grab"></div>' + contentHTML + '</div>';
    box.hidden = false;
    box.onclick = function (e) { if (e.target === box) closeModal(); };
    const inner = box.querySelector('.modal-box');
    if (onMount) onMount(inner);
    return inner;
  }

  function closeModal() {
    const box = document.getElementById('modal');
    box.hidden = true;
    box.innerHTML = '';
  }

  /* Confirmación con botones; devuelve una promesa */
  function confirm(title, message, okLabel, danger) {
    return new Promise(function (resolve) {
      modal(
        html`<h2>${title}</h2><p class="muted">${message}</p>
             <div class="row" style="margin-top:16px">
               <button class="btn grow" data-x="no">Cancelar</button>
               <button class="btn grow ${danger ? 'danger' : 'primary'}" data-x="si">${okLabel || 'Aceptar'}</button>
             </div>`,
        function (el) {
          el.querySelector('[data-x=no]').onclick = function () { closeModal(); resolve(false); };
          el.querySelector('[data-x=si]').onclick = function () { closeModal(); resolve(true); };
        }
      );
    });
  }

  /* ---------- formateo ---------- */
  function num(n) {
    n = Number(n) || 0;
    return n.toLocaleString('es-ES', { maximumFractionDigits: n < 100 ? 1 : 0 });
  }

  function kg(n) {
    return num(n) + ' ' + (Store.settings().unit === 'lb' ? 'lb' : 'kg');
  }

  function mmss(sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function fecha(ts) {
    const d = new Date(ts);
    const hoy = new Date();
    const mismoDia = d.toDateString() === hoy.toDateString();
    const ayer = new Date(hoy.getTime() - 864e5).toDateString() === d.toDateString();
    const hora = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    if (mismoDia) return 'Hoy · ' + hora;
    if (ayer) return 'Ayer · ' + hora;
    return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' · ' + hora;
  }

  function fechaCorta(ts) {
    const d = new Date(ts);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  /* ---------- sonido y vibración ---------- */
  let audioCtx = null;
  function beep(times) {
    if (!Store.settings().sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const n = times || 1;
      for (let i = 0; i < n; i++) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode); gainNode.connect(audioCtx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        const t0 = audioCtx.currentTime + i * 0.22;
        gainNode.gain.setValueAtTime(0.0001, t0);
        gainNode.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        osc.start(t0); osc.stop(t0 + 0.2);
      }
    } catch (e) { /* el navegador puede bloquear el audio hasta la primera interacción */ }
    if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  }

  /* ---------- reproductor de la animación del movimiento ----------
     Cada ejercicio trae 2 fotogramas (posición inicial y final). Alternándolos
     a ritmo constante se ve el recorrido correcto, igual que un GIF. */
  let demoTimers = [];

  function clearDemos() {
    demoTimers.forEach(clearInterval);
    demoTimers = [];
  }

  function demoHTML(ex, opts) {
    opts = opts || {};
    const frames = Data.frames(ex);
    const speed = opts.speed || 900;
    const controls = opts.controls !== false && frames.length > 1;
    return html`
      <div class="demo" data-demo="${JSON.stringify(frames)}" data-speed="${speed}">
        ${raw(frames.map(function (src, i) {
          return '<img class="' + (i === 0 ? 'on' : '') + '" src="' + esc(src) +
                 '" alt="' + (i === 0 ? 'Técnica de ' + esc(ex.nameEs) : '') +
                 '" decoding="async">';
        }).join(''))}
        ${raw(frames.length > 1
          ? '<div class="frame-dots">' + frames.map(function (_, i) {
              return '<i class="' + (i === 0 ? 'on' : '') + '"></i>';
            }).join('') + '</div>'
          : '')}
        ${raw(controls ? `
          <div class="demo-ctl">
            <button data-act="toggle" aria-label="Pausar animación">${icon('pause')}</button>
            <input type="range" min="350" max="2000" step="50" value="${speed}" data-act="speed"
                   aria-label="Velocidad de la animación">
            <span data-out>${(speed / 1000).toFixed(1)}s</span>
          </div>` : '')}
      </div>`;
  }

  /* Arranca todas las animaciones presentes dentro de root */
  function mountDemos(root) {
    (root || document).querySelectorAll('[data-demo]').forEach(function (box) {
      if (box.dataset.mounted) return;
      box.dataset.mounted = '1';

      let frames;
      try { frames = JSON.parse(box.dataset.demo); } catch (e) { return; }
      if (frames.length < 2) return;

      /* los fotogramas están apilados: se alterna la opacidad, nunca el src,
         así el movimiento se ve continuo sin parpadeo */
      const layers = box.querySelectorAll('img');
      const dots = box.querySelectorAll('.frame-dots i');
      const out = box.querySelector('[data-out]');
      const toggleBtn = box.querySelector('[data-act=toggle]');
      const speedInput = box.querySelector('[data-act=speed]');

      let i = 0, playing = true, timer = null;
      let speed = Number(box.dataset.speed) || 900;

      function tick() {
        i = (i + 1) % frames.length;
        layers.forEach(function (l, k) { l.classList.toggle('on', k === i); });
        dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      }
      function run() {
        clearInterval(timer);
        timer = setInterval(tick, speed);
        demoTimers.push(timer);
      }
      run();

      if (toggleBtn) toggleBtn.onclick = function (e) {
        e.stopPropagation();
        playing = !playing;
        toggleBtn.innerHTML = icon(playing ? 'pause' : 'play');
        toggleBtn.setAttribute('aria-label', playing ? 'Pausar animación' : 'Reproducir animación');
        if (playing) run(); else clearInterval(timer);
      };

      if (speedInput) speedInput.oninput = function (e) {
        e.stopPropagation();
        speed = Number(speedInput.value);
        if (out) out.textContent = (speed / 1000).toFixed(1) + 's';
        if (playing) run();
      };
    });
  }

  g.UI = {
    esc: esc, html: html, raw: raw, icon: icon,
    demoHTML: demoHTML, mountDemos: mountDemos, clearDemos: clearDemos,
    toast: toast, modal: modal, closeModal: closeModal, confirm: confirm,
    num: num, kg: kg, mmss: mmss, fecha: fecha, fechaCorta: fechaCorta,
    beep: beep, DAY_NAMES: DAY_NAMES
  };
})(window);
