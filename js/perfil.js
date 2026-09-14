/* perfil.js — datos corporales, hábitos y todo lo que se deriva de ellos.
   Los cálculos son fórmulas contrastadas, no estimaciones de una IA: así el
   plan sale igual siempre y funciona aunque no haya conexión ni clave de IA.

   Nada de esto es consejo médico. Son estimaciones de población general que
   no tienen en cuenta condiciones de salud concretas. */
(function (g) {
  'use strict';

  const VACIO = {
    sexo: '', edad: 0, altura: 0, peso: 0, grasa: 0,
    actividad: 'moderado', objetivo: 'mantener', ritmo: 'moderado', ritmoKg: 0,
    objetivoTexto: '',
    experiencia: 'intermediate',
    sueño: 7, comidas: 4, dieta: 'omnivora',
    /* Marcan el día real: sin ellas, repartir el agua y las comidas por el día
       sería inventarse a qué hora te levantas. */
    despertar: '07:00', acostar: '23:00', horaEntreno: '',
    alergias: '', lesiones: '', notas: '',
    /* Lo que condiciona qué se puede comer: diabetes, tensión, colesterol… */
    condiciones: '',
    /* Con qué cocina de verdad. Un menú con ingredientes que no tiene a mano —o
       que ni conoce— no lo sigue nadie: es la diferencia entre un plan y una
       lista de deseos. Y lo de al lado son órdenes suyas para el menú. */
    despensa: '', ordenesComida: '',
    /* A qué hora empieza cada comida del día. Sirve para cruzar una foto con
       la comida que tocaba: a las 9:00 eso es el desayuno y a las 13:00 es el
       almuerzo, y eso no lo sabe la app si no se lo dices.

       Solo se guarda dónde EMPIEZA cada una; la anterior termina donde empieza
       la siguiente. Pidiendo las dos puntas se puede dejar un hueco entre la
       una y las dos —y entonces una foto de la una y media no es de ninguna
       comida— o solaparlas, y entonces es de dos. Con un solo número por
       franja eso no puede pasar. */
    franjas: { desayuno: '06:00', almuerzo: '12:00', merienda: '16:00', cena: '20:00' },
    pesajes: []          // [{fecha, peso}]
  };

  /* Los nombres, en el orden del día. La cena es la última y se estira hasta
     que empieza el desayuno del día siguiente: quien cena a las once y pica
     algo a la una sigue estando en la cena, no en el desayuno de mañana. */
  const FRANJAS = [
    { id: 'desayuno', label: 'Desayuno' },
    { id: 'almuerzo', label: 'Almuerzo' },
    { id: 'merienda', label: 'Merienda' },
    { id: 'cena', label: 'Cena' }
  ];

  function minutosDe(hhmm) {
    const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }

  /* En qué franja cae una hora. El día no empieza a medianoche sino cuando
     empieza el desayuno, así que todo lo anterior pertenece a la cena de la
     noche pasada. */
  function franjaDe(hhmm) {
    const min = minutosDe(hhmm);
    if (min == null) return null;
    const f = datos().franjas || VACIO.franjas;
    const limites = FRANJAS.map(function (x) {
      return { id: x.id, label: x.label, desde: minutosDe(f[x.id]) };
    }).filter(function (x) { return x.desde != null; });
    if (!limites.length) return null;
    limites.sort(function (a, b) { return a.desde - b.desde; });

    let elegida = limites[limites.length - 1];   // antes del primero = la última
    for (let i = 0; i < limites.length; i++) {
      if (min >= limites[i].desde) elegida = limites[i];
    }
    return elegida;
  }

  function franjas() {
    const f = datos().franjas || VACIO.franjas;
    return FRANJAS.map(function (x) {
      return { id: x.id, label: x.label, desde: f[x.id] || VACIO.franjas[x.id] };
    });
  }

  /* Multiplicadores de gasto según actividad diaria (Harris-Benedict revisado) */
  const ACTIVIDAD = {
    sedentario: { factor: 1.2, label: 'Sedentario', note: 'Trabajo de oficina, sin ejercicio' },
    ligero: { factor: 1.375, label: 'Ligero', note: 'Ejercicio suave 1-3 días por semana' },
    moderado: { factor: 1.55, label: 'Moderado', note: 'Ejercicio 3-5 días por semana' },
    alto: { factor: 1.725, label: 'Alto', note: 'Ejercicio intenso 6-7 días por semana' },
    atleta: { factor: 1.9, label: 'Muy alto', note: 'Trabajo físico o doble sesión' }
  };

  /* Cada objetivo dice dos cosas: hacia donde van las calorias (signo) y
     cuanta proteina por kilo pide (prot). Antes la proteina estaba escrita a
     mano en un si-esto-si-lo-otro dentro de macros(), asi que anadir un
     objetivo obligaba a tocar dos sitios y era facil olvidarse de uno.

     Los tres nuevos van todos a calorias de mantenimiento —signo 0— porque es
     lo que son: recomponer, ponerse fuerte o estar sano no piden ni deficit ni
     superavit, piden proteina y entrenar. Lo que cambia de verdad entre ellos
     es eso y lo que la IA entiende que buscas. */
  const OBJETIVO = {
    perder: { label: 'Perder grasa', signo: -1, prot: 2.2,
      note: 'Déficit sobre tu gasto, con la proteína alta para no perder músculo' },
    recomposicion: { label: 'Recomponer', signo: 0, prot: 2.2,
      note: 'Perder grasa y ganar músculo a la vez: calorías de mantenimiento y mucha proteína' },
    fuerza: { label: 'Ponerme fuerte', signo: 0, prot: 2.0,
      note: 'Sin tocar el peso: lo que sube son los kilos de la barra' },
    mantener: { label: 'Mantenerme', signo: 0, prot: 1.7,
      note: 'Ni subir ni bajar; sostener lo que ya tienes' },
    salud: { label: 'Estar sano', signo: 0, prot: 1.6,
      note: 'Moverme, dormir y comer bien, sin una meta de báscula' },
    ganar: { label: 'Ganar músculo', signo: 1, prot: 1.9,
      note: 'Superávit controlado sobre tu gasto' }
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
    const d = Object.assign({}, VACIO, p || {});
    /* El sueño no se guarda a mano: se deduce de las horas. Derivarlo aquí y no
       solo al guardar evita que un perfil de antes siga diciendo siete horas
       cuando sus horas dicen otra cosa —y que la IA lea una cifra y la pantalla
       otra. */
    const h = horasDeSueno(d.acostar, d.despertar);
    if (h != null) d.sueño = h;
    return d;
  }

  /* Cuánto duerme, deducido de a qué hora se acuesta y a cuál se levanta.
     Pedírselo aparte era pedirle una cuenta que ya había hecho la app dos campos
     más arriba, y con dos sitios donde decir lo mismo siempre acaban
     discrepando. Cruza la medianoche, que es lo normal. */
  function horasDeSueno(acostar, despertar) {
    const min = function (hhmm) {
      const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ''));
      return m ? Number(m[1]) * 60 + Number(m[2]) : null;
    };
    const a = min(acostar), d = min(despertar);
    if (a == null || d == null) return null;
    let horas = (d - a + 1440) % 1440 / 60;
    if (horas < 2 || horas > 14) return null;
    return Math.round(horas * 10) / 10;
  }

  function guardar(cambios) {
    const p = Object.assign({}, datos(), cambios);
    /* si han cambiado las horas, el sueño se recalcula solo */
    const h = horasDeSueno(p.acostar, p.despertar);
    if (h != null) p.sueño = h;
    Store.setSetting('perfil', p);
    return p;
  }

  /* ¿Hay lo mínimo para calcular? */
  function completo(p) {
    p = p || datos();
    return !!(p.sexo && p.edad > 0 && p.altura > 0 && p.peso > 0);
  }

  /* Lo que falta para poder calcular nada. Con esto la pantalla puede decir
     qué pedir en lugar de callarse y no enseñar los números. */
  function loQueFalta(p) {
    p = p || datos();
    const faltan = [];
    if (!p.sexo) faltan.push('el sexo biológico');
    if (!(p.edad > 0)) faltan.push('la edad');
    if (!(p.altura > 0)) faltan.push('la altura');
    if (!(p.peso > 0)) faltan.push('el peso');
    return faltan;
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

  /* El ritmo que toca: uno de los tres de siempre o el que se haya puesto a
     mano. Con un ritmo propio solo se sabe los kilos por semana, asi que el
     porcentaje sale de ahi: un kilo de grasa son unas 7.700 kcal, repartidas
     entre los siete dias y medidas contra el gasto de cada uno. Con tope, que
     un deficit del 40% no es un ritmo, es pasar hambre. */
  function ritmoActual(p) {
    p = p || datos();
    if (p.ritmo === 'propio' && Number(p.ritmoKg) > 0) {
      const kg = Math.min(1.2, Math.max(0.1, Number(p.ritmoKg)));
      const t = tdee(p) || 2000;
      return {
        label: 'El mío', kgSemana: Math.round(kg * 100) / 100,
        pct: Math.min(0.3, (kg * 7700 / 7) / t)
      };
    }
    return RITMO[p.ritmo] || RITMO.moderado;
  }

  /* Calorías objetivo, con suelos de seguridad para no bajar en exceso */
  function calorias(p) {
    p = p || datos();
    const t = tdee(p);
    if (!t) return null;
    const obj = OBJETIVO[p.objetivo] || OBJETIVO.mantener;
    const r = ritmoActual(p);
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

    const porKg = (OBJETIVO[p.objetivo] || OBJETIVO.mantener).prot || 1.7;
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
    const r = ritmoActual(p);
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
      'objetivo: ' + (OBJETIVO[p.objetivo] || {}).label +
        (p.objetivoTexto ? ' (con sus palabras: "' + p.objetivoTexto + '")' : ''),
      'ritmo ' + ritmoActual(p).label,
      'gasto estimado ' + Math.round(tdee(p)) + ' kcal',
      m ? 'objetivo diario ' + m.kcal + ' kcal (' + m.prot + ' g proteína, ' +
        m.carbo + ' g hidratos, ' + m.grasa + ' g grasa)' : null,
      'duerme ' + p.sueño + ' h',
      'se levanta a las ' + p.despertar + ' y se acuesta a las ' + p.acostar,
      p.comidas + ' comidas al día',
      'dieta: ' + (DIETA[p.dieta] || p.dieta),
      p.alergias ? 'alergias o intolerancias: ' + p.alergias : null,
      p.lesiones ? 'lesiones o limitaciones: ' + p.lesiones : null,
      p.condiciones ? 'condiciones de salud: ' + p.condiciones : null,
      p.notas ? 'notas: ' + p.notas : null
    ];
    return partes.filter(Boolean).join('; ') + '.';
  }

  g.Perfil = {
    FRANJAS: FRANJAS, franjas: franjas, franjaDe: franjaDe,
    ACTIVIDAD: ACTIVIDAD, OBJETIVO: OBJETIVO, RITMO: RITMO, DIETA: DIETA,
    datos: datos, guardar: guardar, completo: completo, loQueFalta: loQueFalta,
    horasDeSueno: horasDeSueno,
    imc: imc, categoriaIMC: categoriaIMC, pesoSaludable: pesoSaludable,
    tmb: tmb, tdee: tdee, calorias: calorias, macros: macros, agua: agua,
    ritmoActual: ritmoActual,
    previsión: previsión, registrarPeso: registrarPeso, pesajes: pesajes,
    tendencia: tendencia, resumen: resumen
  };
})(window);
