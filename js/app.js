/* ==========================================================
   App: ¿Qué Suzuki eres?
   - Maneja el flujo de pantallas (welcome → register → quiz → result)
   - Renderiza preguntas paso a paso
   - Guarda el registro en Supabase
   ========================================================== */

(() => {
  'use strict';

  // ---------- Estado ----------
  const state = {
    name: '',
    email: '',
    phone: '',
    currentQuestion: 0,
    answers: [],          // ej: ['swift', 'dzire', 'jimny', 'swift']
    result: null,         // 'swift' | 'dzire' | 'jimny'
    startedAt: null
  };

  // ---------- Almacenamiento (local + opcional Supabase) ----------
  // La lógica vive en js/storage.js
  console.log('[Suzuki] Storage listo. Sync remoto:', Storage.hasRemote ? 'sí' : 'solo local');

  // ---------- DOM helpers ----------
  const $  = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const screens = {};
  $$('.screen').forEach(el => { screens[el.dataset.screen] = el; });

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('is-active'));
    const target = screens[name];
    if (target) {
      target.classList.add('is-active');
      target.scrollTop = 0;
    }
  }

  // ---------- Welcome ----------
  document.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'start') {
      state.startedAt = new Date().toISOString();
      showScreen('register');
      setTimeout(() => $('#name')?.focus(), 350);
    }
    if (action === 'restart') {
      resetState();
      showScreen('welcome');
    }
  });

  // ---------- Register ----------
  $('#register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = $('#name').value.trim();
    const email = $('#email').value.trim();
    const phone = $('#phone').value.trim();
    const err   = $('#form-error');

    err.textContent = '';

    if (name.length < 2) {
      err.textContent = 'Escribe tu nombre.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = 'Escribe un correo válido.';
      return;
    }
    // teléfono: mínimo 7 dígitos (ignorando espacios, guiones, +, paréntesis)
    const phoneDigits = phone.replace(/[^\d]/g, '');
    if (phoneDigits.length < 7) {
      err.textContent = 'Escribe un teléfono válido.';
      return;
    }

    state.name = name;
    state.email = email;
    state.phone = phone;
    state.currentQuestion = 0;
    state.answers = [];

    showScreen('quiz');
    renderQuestion();
  });

  // ---------- Quiz ----------
  function renderQuestion() {
    const idx = state.currentQuestion;
    const q   = QUIZ_QUESTIONS[idx];

    $('#question-title').textContent = q.text;
    $('#progress-label').textContent = `${idx + 1} / ${QUIZ_QUESTIONS.length}`;
    $('#progress-bar').style.width = `${((idx) / QUIZ_QUESTIONS.length) * 100}%`;

    const optsEl = $('#options');
    optsEl.innerHTML = '';

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option';
      btn.setAttribute('data-value', opt.value);
      btn.innerHTML = `
        <span class="option__letter">${opt.letter}</span>
        <span class="option__text">${opt.text}</span>
      `;
      btn.addEventListener('click', () => handleAnswer(opt.value, btn));
      optsEl.appendChild(btn);
    });
  }

  function handleAnswer(value, btnEl) {
    // marca selección visualmente
    $$('.option').forEach(b => b.classList.remove('is-selected'));
    btnEl.classList.add('is-selected');

    state.answers.push(value);

    // anima la progress bar
    const idx = state.currentQuestion + 1;
    $('#progress-bar').style.width = `${(idx / QUIZ_QUESTIONS.length) * 100}%`;

    // espera 350ms para que el usuario vea la selección, luego avanza
    setTimeout(() => {
      if (state.currentQuestion < QUIZ_QUESTIONS.length - 1) {
        state.currentQuestion++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 350);
  }

  // ---------- Finish ----------
  async function finishQuiz() {
    state.result = calculateResult(state.answers);
    showScreen('loading');

    // Guarda local (y push remoto si hay supabase) — siempre rápido
    const save = Storage.save({
      name:        state.name,
      email:       state.email,
      phone:       state.phone,
      result:      state.result,
      result_name: QUIZ_RESULTS[state.result].name,
      answers:     state.answers,
      started_at:  state.startedAt,
      finished_at: new Date().toISOString()
    });

    const minWait = new Promise(r => setTimeout(r, 900));
    await Promise.all([save, minWait]);

    renderResult();
    showScreen('result');
  }

  function renderResult() {
    const res = QUIZ_RESULTS[state.result];
    const resultEl = $('.result');

    resultEl.classList.remove('result--swift', 'result--dzire', 'result--jimny');
    resultEl.classList.add(`result--${res.key}`);

    $('#result-name').textContent  = res.name;
    $('#result-image').src         = res.image;
    $('#result-image').alt         = res.name;
    $('#result-desc').textContent  = res.headline;

    const traitsEl = $('#result-traits');
    traitsEl.innerHTML = '';
    res.traits.forEach(t => {
      const span = document.createElement('span');
      span.className = 'trait';
      span.textContent = t;
      traitsEl.appendChild(span);
    });
  }

  // ---------- Reset ----------
  function resetState() {
    state.name = '';
    state.email = '';
    state.phone = '';
    state.currentQuestion = 0;
    state.answers = [];
    state.result = null;
    state.startedAt = null;
    $('#register-form').reset();
    $('#form-error').textContent = '';
  }

  // ---------- iPad: evita zoom en doble tap ----------
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch <= 350) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

})();
