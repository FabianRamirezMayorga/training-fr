/* planner.js — genera un plan semanal completo a partir de cuatro respuestas:
   qué días entrenas, cuánto tiempo tienes, qué material y qué objetivo.
   Reparte los grupos musculares por día (split) y elige los ejercicios. */
(function (g) {
  'use strict';

  /* ---- Splits: qué se trabaja cada día según cuántos días entrenes ----
     Cada día es {nombre, músculos: [id de músculo, ...]} en orden de prioridad. */
  const SPLITS = {
    1: [
      { name: 'Cuerpo completo', muscles: ['quadriceps', 'chest', 'lats', 'shoulders', 'hamstrings', 'abdominals'] }
    ],
    2: [
      { name: 'Torso', muscles: ['chest', 'lats', 'shoulders', 'triceps', 'biceps'] },
      { name: 'Pierna y core', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abdominals'] }
    ],
    3: [
      { name: 'Empuje', muscles: ['chest', 'shoulders', 'triceps'] },
      { name: 'Tracción', muscles: ['lats', 'middle back', 'biceps', 'traps'] },
      { name: 'Pierna', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'] }
    ],
    4: [
      { name: 'Pecho y tríceps', muscles: ['chest', 'triceps'] },
      { name: 'Espalda y bíceps', muscles: ['lats', 'middle back', 'biceps'] },
      { name: 'Pierna', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'] },
      { name: 'Hombro y core', muscles: ['shoulders', 'traps', 'abdominals'] }
    ],
    5: [
      { name: 'Pecho y tríceps', muscles: ['chest', 'triceps'] },
      { name: 'Espalda y bíceps', muscles: ['lats', 'middle back', 'biceps'] },
      { name: 'Pierna', muscles: ['quadriceps', 'hamstrings', 'calves'] },
      { name: 'Hombro y trapecio', muscles: ['shoulders', 'traps'] },
      { name: 'Glúteo y core', muscles: ['glutes', 'hamstrings', 'abdominals'] }
    ],
    6: [
      { name: 'Empuje pesado', muscles: ['chest', 'shoulders', 'triceps'] },
      { name: 'Tracción pesada', muscles: ['lats', 'middle back', 'biceps'] },
      { name: 'Pierna pesada', muscles: ['quadriceps', 'hamstrings', 'glutes'] },
      { name: 'Empuje volumen', muscles: ['chest', 'shoulders', 'triceps'] },
      { name: 'Tracción volumen', muscles: ['lats', 'traps', 'biceps'] },
      { name: 'Pierna y core', muscles: ['glutes', 'hamstrings', 'calves', 'abdominals'] }
    ]
  };

  /* ---- Ejercicios recomendados por músculo, en orden de preferencia.
         Todos verificados contra el catálogo. El planificador filtra por
         material disponible y completa con el catálogo si hiciera falta. ---- */
  const PICKS = {
    chest: ['Barbell_Bench_Press_-_Medium_Grip', 'Incline_Dumbbell_Press', 'Dumbbell_Bench_Press',
      'Barbell_Incline_Bench_Press_-_Medium_Grip', 'Dips_-_Chest_Version', 'Dumbbell_Flyes',
      'Cable_Crossover', 'Butterfly', 'Pushups', 'Decline_Dumbbell_Bench_Press',
      'Push-Ups_With_Feet_Elevated'],
    lats: ['Pullups', 'Wide-Grip_Lat_Pulldown', 'Chin-Up', 'One-Arm_Dumbbell_Row',
      'Seated_Cable_Rows', 'Straight-Arm_Pulldown'],
    'middle back': ['Bent_Over_Barbell_Row', 'Seated_Cable_Rows', 'One-Arm_Dumbbell_Row',
      'T-Bar_Row_with_Handle', 'Face_Pull'],
    'lower back': ['Barbell_Deadlift', 'Romanian_Deadlift', 'Hyperextensions_Back_Extensions',
      'Rack_Pulls', 'Good_Morning'],
    traps: ['Barbell_Shrug', 'Dumbbell_Shrug', 'Upright_Cable_Row', 'Face_Pull'],
    shoulders: ['Standing_Military_Press', 'Dumbbell_Shoulder_Press', 'Arnold_Dumbbell_Press',
      'Side_Lateral_Raise', 'Front_Dumbbell_Raise', 'Reverse_Machine_Flyes',
      'Barbell_Rear_Delt_Row', 'Face_Pull'],
    quadriceps: ['Barbell_Squat', 'Leg_Press', 'Front_Squat_Clean_Grip', 'Barbell_Lunge',
      'Dumbbell_Lunges', 'Leg_Extensions', 'Barbell_Step_Ups', 'Bodyweight_Squat',
      'Bodyweight_Walking_Lunge'],
    hamstrings: ['Romanian_Deadlift', 'Lying_Leg_Curls', 'Seated_Leg_Curl',
      'Stiff-Legged_Barbell_Deadlift', 'Stiff-Legged_Dumbbell_Deadlift',
      'Glute_Ham_Raise', 'Good_Morning'],
    glutes: ['Barbell_Hip_Thrust', 'Barbell_Glute_Bridge', 'Single_Leg_Glute_Bridge',
      'Glute_Kickback', 'Barbell_Step_Ups', 'Dumbbell_Rear_Lunge', 'Bodyweight_Walking_Lunge'],
    calves: ['Standing_Calf_Raises', 'Seated_Calf_Raise', 'Calf_Press_On_The_Leg_Press_Machine',
      'Calf_Raise_On_A_Dumbbell'],
    biceps: ['Barbell_Curl', 'Alternate_Hammer_Curl', 'Incline_Dumbbell_Curl',
      'Preacher_Curl', 'Cable_Hammer_Curls_-_Rope_Attachment', 'Concentration_Curls'],
    triceps: ['Triceps_Pushdown', 'Close-Grip_Barbell_Bench_Press', 'Lying_Triceps_Press',
      'Dips_-_Triceps_Version', 'Seated_Triceps_Press', 'Bench_Dips',
      'Cable_Rope_Overhead_Triceps_Extension', 'Push-Ups_-_Close_Triceps_Position'],
    forearms: ['Palms-Up_Barbell_Wrist_Curl_Over_A_Bench', 'Palms-Down_Wrist_Curl_Over_A_Bench'],
    abdominals: ['Hanging_Leg_Raise', 'Cable_Crunch', 'Plank', 'Russian_Twist',
      'Crunches', 'Air_Bike', 'Mountain_Climbers', 'Flat_Bench_Leg_Pull-In'],
    adductors: ['Thigh_Adductor'],
    abductors: ['Thigh_Abductor', 'Monster_Walk']
  };

  const GEAR = Data.GEAR;

  /* Todos los ids recomendados, en un Set, para que el catálogo los priorice */
  const RECOMENDADOS = new Set(
    Object.keys(PICKS).reduce(function (acc, m) { return acc.concat(PICKS[m]); }, [])
  );

  /* ---- Objetivo: define series, repeticiones y descanso ---- */
  const GOALS = {
    fuerza: { label: 'Fuerza', sets: 5, reps: 5, rest: 150, isoSets: 3, isoReps: 8, isoRest: 90 },
    hipertrofia: { label: 'Ganar músculo', sets: 4, reps: 10, rest: 90, isoSets: 3, isoReps: 12, isoRest: 60 },
    resistencia: { label: 'Definir y resistencia', sets: 3, reps: 15, rest: 45, isoSets: 3, isoReps: 18, isoRest: 40 }
  };

  const LEVELS = { beginner: 1, intermediate: 2, expert: 3 };

  /* Cuántos ejercicios caben en la sesión.
     Se estima el coste real de cada ejercicio: series x (descanso + ~40 s de trabajo),
     descontando 8 minutos de calentamiento. */
  function exerciseCount(minutes, goal) {
    const useful = Math.max(12, minutes - 8) * 60;
    const perExercise = goal.sets * (goal.rest + 40);
    return Math.max(3, Math.min(9, Math.round(useful / perExercise)));
  }

  /* Reparte N ejercicios entre los músculos del día, dando más a los primeros
     (que son los prioritarios del split) y al menos uno a cada uno. */
  function share(muscles, total) {
    const out = muscles.map(function () { return 0; });
    let left = total;
    for (let i = 0; i < muscles.length && left > 0; i++) { out[i] = 1; left--; }
    let i = 0;
    while (left > 0) { out[i % muscles.length]++; left--; i++; }
    return out;
  }

  /* Candidatos para un músculo: primero los recomendados, después el resto
     del catálogo puntuado, siempre respetando el material y el nivel. */
  function candidates(muscle, gear, level) {
    const allow = GEAR[gear].allow;
    const maxLevel = LEVELS[level] || 2;

    const ok = function (ex) {
      return ex &&
        ex.primaryMuscles.indexOf(muscle) !== -1 &&
        allow.indexOf(ex.equipment) !== -1 &&
        (LEVELS[ex.level] || 2) <= maxLevel + (maxLevel === 1 ? 1 : 0) &&
        ex.images.length >= 2;
    };

    const first = (PICKS[muscle] || []).map(Data.get).filter(ok);

    const rest = Data.all().filter(function (ex) {
      if (!ok(ex)) return false;
      if (first.indexOf(ex) !== -1) return false;
      return ['strength', 'powerlifting', 'olympic weightlifting'].indexOf(ex.category) !== -1;
    }).sort(function (a, b) {
      const score = function (ex) {
        return (ex.mechanic === 'compound' ? 2 : 0) +
          (ex.equipment === 'barbell' || ex.equipment === 'dumbbell' ? 1 : 0);
      };
      return score(b) - score(a);
    });

    return first.concat(rest);
  }

  /* Genera el plan. opts: {days:['Lun',...], minutes, gear, goal, level} */
  function generate(opts) {
    const goal = GOALS[opts.goal] || GOALS.hipertrofia;
    const days = opts.days.slice();
    const split = SPLITS[Math.min(6, Math.max(1, days.length))];
    const perSession = exerciseCount(opts.minutes, goal);

    const usadosSemana = {};

    return days.map(function (day, di) {
      const plan = split[di % split.length];
      const cuota = share(plan.muscles, perSession);
      const usados = {};
      const ejercicios = [];

      plan.muscles.forEach(function (muscle, mi) {
        const pool = candidates(muscle, opts.gear, opts.level);
        /* los que aún no han salido esta semana van delante */
        const orden = pool.filter(function (ex) { return !usadosSemana[ex.id]; })
          .concat(pool.filter(function (ex) { return usadosSemana[ex.id]; }));
        let añadidos = 0;
        for (let i = 0; i < orden.length && añadidos < cuota[mi]; i++) {
          const ex = orden[i];
          if (usados[ex.id]) continue;
          usados[ex.id] = true;
          usadosSemana[ex.id] = true;
          añadidos++;

          /* el primer ejercicio de cada músculo es el pesado; los siguientes,
             accesorios con más repeticiones y menos descanso */
          const pesado = añadidos === 1 && ex.mechanic === 'compound';
          const estatico = ex.force === 'static';
          ejercicios.push({
            exId: ex.id,
            sets: pesado ? goal.sets : goal.isoSets,
            reps: estatico ? 40 : (pesado ? goal.reps : goal.isoReps),
            weight: 0,
            rest: pesado ? goal.rest : goal.isoRest,
            note: estatico ? 'Aguanta la posición: las repeticiones son segundos.' : ''
          });
        }
      });

      return {
        id: null,
        name: day + ' · ' + plan.name,
        note: 'Generado para ' + opts.minutes + ' min · ' + goal.label.toLowerCase() +
          ' · ' + GEAR[opts.gear].label.toLowerCase() + '. Ajusta lo que quieras.',
        days: [day],
        muscles: plan.muscles,
        exercises: ejercicios
      };
    });
  }

  /* Duración estimada de una rutina ya construida, en minutos */
  function estimate(routine) {
    const seg = routine.exercises.reduce(function (t, e) {
      return t + e.sets * ((e.rest || 60) + 40);
    }, 0);
    return Math.round(seg / 60) + 8;
  }

  g.Planner = {
    generate: generate, estimate: estimate,
    GOALS: GOALS, SPLITS: SPLITS, PICKS: PICKS, RECOMENDADOS: RECOMENDADOS
  };
})(window);
