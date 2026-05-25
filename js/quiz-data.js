/* ==========================================================
   Datos del quiz "¿Qué Suzuki eres?"
   - 4 preguntas
   - 3 modelos: Swift (A), Dzire (B), Jimny (C)
   ========================================================== */

const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: '¿Cómo describes tu plan ideal de fin de semana?',
    options: [
      { letter: 'A', text: 'Salir con amigos: bares, música y ciudad',          value: 'swift' },
      { letter: 'B', text: 'Algo tranquilo, en familia, organizando pendientes', value: 'dzire' },
      { letter: 'C', text: 'Escaparme a algún lugar nuevo, naturaleza o roadtrip', value: 'jimny' }
    ]
  },
  {
    id: 2,
    text: 'Cuando manejas, ¿qué valoras más?',
    options: [
      { letter: 'A', text: 'Agilidad y estilo',                  value: 'swift' },
      { letter: 'B', text: 'Ahorro y comodidad',                 value: 'dzire' },
      { letter: 'C', text: 'Capacidad para ir a cualquier lugar', value: 'jimny' }
    ]
  },
  {
    id: 3,
    text: 'Si fueras un tipo de ruta, ¿cuál serías?',
    options: [
      { letter: 'A', text: 'Calles urbanas con movimiento',     value: 'swift' },
      { letter: 'B', text: 'Trayectos diarios bien planeados',  value: 'dzire' },
      { letter: 'C', text: 'Caminos fuera de lo común',         value: 'jimny' }
    ]
  },
  {
    id: 4,
    text: '¿Qué te representa más?',
    options: [
      { letter: 'A', text: 'Me gusta destacar y disfrutar el momento',          value: 'swift' },
      { letter: 'B', text: 'Prefiero decisiones inteligentes y prácticas',      value: 'dzire' },
      { letter: 'C', text: 'Busco experiencias diferentes y libertad',          value: 'jimny' }
    ]
  }
];

const QUIZ_RESULTS = {
  swift: {
    key: 'swift',
    name: 'Swift BoosterGreen',
    headline: 'Eres Swift: dinámico, divertido y siempre en movimiento.',
    description: 'Espontáneo, social y dinámico. Te gusta la ciudad, la velocidad y destacar. Eres el que se mueve rápido y disfruta el camino.',
    traits: ['Espontáneo', 'Social', 'Dinámico', 'Urbano'],
    image: 'assets/swift-booster-green-amarillo-ocaso.png'
  },
  dzire: {
    key: 'dzire',
    name: 'Dzire BoosterGreen',
    headline: 'Eres Dzire: práctico, inteligente y siempre un paso adelante.',
    description: 'Práctico, organizado e inteligente en gasto. Buscas eficiencia y comodidad diaria. Eres el que toma decisiones inteligentes.',
    traits: ['Práctico', 'Organizado', 'Inteligente', 'Eficiente'],
    image: 'assets/DZIRE-BOOSTERGREEN-2026.png'
  },
  jimny: {
    key: 'jimny',
    name: 'Jimny 5 Puertas',
    headline: 'Eres Jimny: libre, aventurero y listo para cualquier camino.',
    description: 'Aventurero e independiente. Te gusta explorar y valoras la libertad sobre la comodidad. Eres el que elige el camino diferente.',
    traits: ['Aventurero', 'Independiente', 'Auténtico', 'Libre'],
    image: 'assets/JIMNY-5-DOOR-2026.png'
  }
};

/**
 * Calcula el modelo ganador a partir del arreglo de respuestas.
 * answers = ['swift', 'dzire', 'jimny', ...]
 * Reglas de desempate (2-2):
 *  - A + C empate  → swift (con espíritu aventurero)
 *  - B + C empate  → jimny (con versatilidad)
 *  - A + B empate  → dzire (más racional)
 *  - 3-way tie (improbable con 4 preguntas) → swift por defecto
 */
function calculateResult(answers) {
  const counts = { swift: 0, dzire: 0, jimny: 0 };
  answers.forEach(a => { if (counts[a] !== undefined) counts[a]++; });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const [top, second] = sorted;

  // Ganador claro
  if (top[1] > second[1]) return top[0];

  // Empate (2-2) — desempate por brief
  const tied = sorted.filter(e => e[1] === top[1]).map(e => e[0]).sort();
  const key = tied.join('-');

  if (key === 'jimny-swift')   return 'swift'; // A + C → Swift
  if (key === 'dzire-jimny')   return 'jimny'; // B + C → Jimny
  if (key === 'dzire-swift')   return 'dzire'; // A + B → Dzire

  return 'swift'; // fallback
}
