/* perfil.js — datos corporales, hábitos y todo lo que se deriva de ellos.
   Los cálculos son fórmulas contrastadas, no estimaciones de una IA: así el
   plan sale igual siempre y funciona aunque no haya conexión ni clave de IA.

   Nada de esto es consejo médico. Son estimaciones de población general que
   no tienen en cuenta condiciones de salud concretas. */
(function (g) {
  'use strict';

  const VACIO = {
    sexo: '', edad: 0, altura: 0, peso: 0, grasa: 0,
    actividad: 'moderado', objetivo: 'mantener', ritmo: 'moderado',
    experiencia: 'intermediate',
    sueño: 7, comidas: 4, dieta: 'omnivora',
    alergias: '', lesiones: '', notas: '',
    pesajes: []          // [{fecha, peso}]
  };

  /* Multiplicadores de gasto según actividad diaria (Harris-Benedict revisado) */
  const ACTIVIDAD = {
    sedentario: { factor: 1.2, label: 'Sedentario', note: 'Trabajo de oficina, sin ejercicio' },
    ligero: { factor: 1.375, label: 'Ligero', note: 'Ejercicio suave 1-3 días por semana' },
    moderado: { factor: 1.55, label: 'Moderado', note: 'Ejercicio 3-5 días por semana' },
    alto: { factor: 1.725, label: 'Alto', note: 'Ejercicio intenso 6-7 días por semana' },
    atleta: { factor: 1.9, label: 'Muy alto', note: 'Trabajo físico o doble sesión' }
  };

  const OBJETIVO = {
    perder: { label: 'Perder grasa', signo: -1 },
    mantener: { label: 'Mantenerme', signo: 0 },
    ganar: { label: 'Ganar músculo', signo: 1 }
  };

  /* Porcentaje de ajuste sobre el gasto, según lo agresivo que sea el ritmo */
  const RITMO = {
    suave: { label: 'Suave', pct: 0.10, kgSemana: 0.25 },
    moderado: { label: 'Moderado', pct: 0.18, kgSemana: 0.45 },
    rapido: { label: 'Rápido', pct: 0.25, kgSemana: 0.7 }
  };

  const DIETA = {
    omnivora: 'Sin restricciones',
    vegetariana: 'Vegetariana',
    vegana: 'Vegana',
    sinlactosa: 'Sin lactosa',
    singluten: 'Sin gluten'
  };

  function datos() {
    const p = Store.settings().perfil;
    return Object.assign({}, VACIO, p || {});
  }

  function guardar(cambios) {
    const p = Object.assign({}, datos(), cambios);
    Store.setSetting('perfil', p);
    return p;
  }

  /* ¿Hay lo mínimo para calcular? */
  function completo(p) {
    p = p || datos();
    return !!(p.sexo && p.edad > 0 && p.altura > 0 && p.peso > 0);
  }

  function imc(p) {
    p = p || datos();
    if (!p.altura || !p.peso) return null;
    const m = p.altura / 100;
    return p.peso / (m * m);
  }

  function categoriaIMC(v) {
    if (v == null) return { label: '—', tono: 'dim' };
    if (v < 18.5) return { label: 'Bajo peso', tono: 'warn' };
    if (v < 25) return { label: 'Peso normal', tono: 'ok' };
    if (v < 30) return { label: 'Sobrepeso', tono: 'warn' };
    return { label: 'Obesidad', tono: 'bad' };
  }

  /* Rango de peso correspondiente a un IMC de 18,5 a 24,9 */
  function pesoSaludable(p) {
    p = p || datos();
    if (!p.altura) return null;
    const m = p.altura / 100;
    return { min: 18.5 * m * m, max: 24.9 * m * m };
  }

  /* Metabolismo basal. Mifflin-St Jeor es la más fiable sin medir grasa;
     con porcentaje de grasa conocido se usa Katch-McArdle, más precisa. */
  function tmb(p) {
    p = p || datos();
    if (!completo(p)) return null;
    if (p.grasa > 0 && p.grasa < 60) {
      const magra = p.peso * (1 - p.grasa / 100);
      return 370 + 21.6 * magra;
    }
    const base = 10 * p.peso + 6.25 * p.altura - 5 * p.edad;
    return p.sexo === 'mujer' ? base - 161 : base + 5;
  }

  /* Gasto energético total del día */
  function tdee(p) {
    p = p || datos();
    const b = tmb(p);
    if (!b) return null;
    const a = ACTIVIDAD[p.actividad] || ACTIVIDAD.moderado;
    return b * a.factor;
  }

  /* Calorías objetivo, con suelos de seguridad para no bajar en exceso */
  function calorias(p) {
    p = p || datos();
    const t = tdee(p);
    if (!t) return null;
    const obj = OBJETIVO[p.objetivo] || OBJETIVO.mantener;
    const r = RITMO[p.ritmo] || RITMO.moderado;
    let kcal = t * (1 + obj.signo * r.pct);

    /* nunca por debajo del metabolismo basal ni de los mínimos habituales */
    const suelo = Math.max(tmb(p), p.sexo === 'mujer' ? 1200 : 1500);
    if (kcal < suelo) kcal = suelo;
    return Math.round(kcal / 10) * 10;
  }

  /* Reparto de macronutrientes.
     Proteína por kg de peso según objetivo, grasa como porcentaje de las
     calorías y el resto en hidratos. */
  function macros(p) {
    p = p || datos();
    const kcal = calorias(p);
    if (!kcal) return null;

    const porKg = p.objetivo === 'perder' ? 2.2 : p.objetivo === 'ganar' ? 1.9 : 1.7;
    let prot = Math.round(p.peso * porKg);
    const pctGrasa = p.objetivo === 'perder' ? 0.27 : 0.30;
    let grasa = Math.round(kcal * pctGrasa / 9);
    let carbo = Math.round((kcal - prot * 4 - grasa * 9) / 4);

    /* si el reparto deja los hidratos demasiado bajos, se cede algo de grasa */
    if (carbo < 50) {
      grasa = Math.max(Math.round(kcal * 0.22 / 9), 30);
      carbo = Math.round((kcal - prot * 4 - grasa * 9) / 4);
    }
    return { kcal: kcal, prot: prot, grasa: grasa, carbo: Math.max(carbo, 0) };
  }

  /* Agua recomendada al día, en litros */
  function agua(p) {
    p = p || datos();
    if (!p.peso) return null;
    const extra = p.actividad === 'alto' || p.actividad === 'atleta' ? 0.5 : 0.25;
    return Math.round((p.peso * 0.033 + extra) * 10) / 10;
  }

  /* Cuánto tarda en alcanzarse el peso deseado al ritmo elegido */
  function previsión(p, pesoMeta) {
    p = p || datos();
    if (!p.peso || !pesoMeta) return null;
    const dif = pesoMeta - p.peso;
    if (Math.abs(dif) < 0.3) return { semanas: 0, dif: dif };
    const r = RITMO[p.ritmo] || RITMO.moderado;
    return { semanas: Math.ceil(Math.abs(dif) / r.kgSemana), dif: dif };
  }

  /* ---------- registro de peso ---------- */

  function registrarPeso(kg, fecha) {
    const p = datos();
    const lista = (p.pesajes || []).slice();
    const dia = Store.dayKey(fecha || Date.now());
    const i = lista.findIndex(function (x) { return Store.dayKey(x.fecha) === dia; });
    const entrada = { fecha: fecha || Date.now(), peso: Number(kg) };
    if (i === -1) lista.push(entrada); else lista[i] = entrada;
    lista.sort(function (a, b) { return a.fecha - b.fecha; });
    return guardar({ pesajes: lista, peso: Number(kg) });
  }

  function pesajes() { return (datos().pesajes || []).slice(); }

  /* Diferencia de peso en los últimos días indicados */
  function tendencia(dias) {
    const lista = pesajes();
    if (lista.length < 2) return null;
    const desde = Date.now() - (dias || 30) * 864e5;
    const rango = lista.filter(function (x) { return x.fecha >= desde; });
    if (rango.length < 2) return null;
    return {
      dif: rango[rango.length - 1].peso - rango[0].peso,
      desde: rango[0].fecha,
      n: rango.length
    };
  }

  /* Resumen en texto plano, para dárselo a la IA como contexto */
  function resumen() {
    const p = datos();
    if (!completo(p)) return '';
    const m = macros(p);
    const partes = [
      p.sexo === 'mujer' ? 'Mujer' : 'Hombre',
      p.edad + ' años',
      p.altura + ' cm',
      p.peso + ' kg',
      p.grasa ? p.grasa + '% de grasa corporal' : null,
      'IMC ' + imc(p).toFixed(1),
      'actividad ' + (ACTIVIDAD[p.actividad] || {}).label,
      'objetivo: ' + (OBJETIVO[p.objetivo] || {}).label,
      'ritmo ' + (RITMO[p.ritmo] || {}).label,
      'gasto estimado ' + Math.round(tdee(p)) + ' kcal',
      m ? 'objetivo diario ' + m.kcal + ' kcal (' + m.prot + ' g proteína, ' +
        m.carbo + ' g hidratos, ' + m.grasa + ' g grasa)' : null,
      'duerme ' + p.sueño + ' h',
      p.comidas + ' comidas al día',
      'dieta: ' + (DIETA[p.dieta] || p.dieta),
      p.alergias ? 'alergias o intolerancias: ' + p.alergias : null,
      p.lesiones ? 'lesiones o limitaciones: ' + p.lesiones : null,
      p.notas ? 'notas: ' + p.notas : null
    ];
    return partes.filter(Boolean).join('; ') + '.';
  }

  g.Perfil = {
    ACTIVIDAD: ACTIVIDAD, OBJETIVO: OBJETIVO, RITMO: RITMO, DIETA: DIETA,
    datos: datos, guardar: guardar, completo: completo,
    imc: imc, categoriaIMC: categoriaIMC, pesoSaludable: pesoSaludable,
    tmb: tmb, tdee: tdee, calorias: calorias, macros: macros, agua: agua,
    previsión: previsión, registrarPeso: registrarPeso, pesajes: pesajes,
    tendencia: tendencia, resumen: resumen
  };
})(window);
