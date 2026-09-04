/* templates.js — rutinas de arranque listas para usar.
   Todos los IDs están verificados contra el catálogo. Se copian a "mis rutinas",
   así que se pueden editar libremente sin tocar la plantilla. */
(function (g) {
  'use strict';

  /* [id, series, reps, descanso en segundos] */
  const TEMPLATES = [
    {
      id: 'fullbody',
      name: 'Full Body 3 días',
      goal: 'Fuerza general',
      level: 'Principiante',
      note: 'Tres sesiones por semana en días alternos (lunes, miércoles, viernes). La mejor opción para empezar: cada músculo se trabaja tres veces por semana.',
      days: ['Lun', 'Mié', 'Vie'],
      exercises: [
        ['Barbell_Squat', 3, 8, 120],
        ['Barbell_Bench_Press_-_Medium_Grip', 3, 8, 120],
        ['Bent_Over_Barbell_Row', 3, 10, 90],
        ['Standing_Military_Press', 3, 10, 90],
        ['Romanian_Deadlift', 3, 10, 90],
        ['Plank', 3, 45, 60]
      ]
    },
    {
      id: 'ppl-push',
      name: 'Push (empuje)',
      goal: 'Hipertrofia',
      level: 'Intermedio',
      note: 'Día de empuje del clásico Push / Pull / Legs: pecho, hombro y tríceps.',
      days: ['Lun', 'Jue'],
      exercises: [
        ['Barbell_Bench_Press_-_Medium_Grip', 4, 8, 120],
        ['Incline_Dumbbell_Press', 3, 10, 90],
        ['Dumbbell_Shoulder_Press', 3, 10, 90],
        ['Dumbbell_Flyes', 3, 12, 60],
        ['Side_Lateral_Raise', 3, 15, 60],
        ['Triceps_Pushdown', 3, 12, 60]
      ]
    },
    {
      id: 'ppl-pull',
      name: 'Pull (tracción)',
      goal: 'Hipertrofia',
      level: 'Intermedio',
      note: 'Día de tracción: espalda y bíceps.',
      days: ['Mar', 'Vie'],
      exercises: [
        ['Pullups', 4, 8, 120],
        ['Bent_Over_Barbell_Row', 4, 8, 120],
        ['Seated_Cable_Rows', 3, 10, 90],
        ['Face_Pull', 3, 15, 60],
        ['Barbell_Curl', 3, 10, 60],
        ['Alternate_Hammer_Curl', 3, 12, 60]
      ]
    },
    {
      id: 'ppl-legs',
      name: 'Legs (pierna)',
      goal: 'Hipertrofia',
      level: 'Intermedio',
      note: 'Día de pierna completo: cuádriceps, isquios, glúteo y gemelo.',
      days: ['Mié', 'Sáb'],
      exercises: [
        ['Barbell_Squat', 4, 8, 150],
        ['Romanian_Deadlift', 3, 10, 120],
        ['Leg_Press', 3, 12, 90],
        ['Lying_Leg_Curls', 3, 12, 60],
        ['Leg_Extensions', 3, 15, 60],
        ['Standing_Calf_Raises', 4, 15, 45]
      ]
    },
    {
      id: 'upper',
      name: 'Torso',
      goal: 'Fuerza e hipertrofia',
      level: 'Intermedio',
      note: 'Mitad superior del clásico Torso / Pierna, dos veces por semana.',
      days: ['Lun', 'Jue'],
      exercises: [
        ['Barbell_Bench_Press_-_Medium_Grip', 4, 6, 150],
        ['Wide-Grip_Lat_Pulldown', 4, 10, 90],
        ['Standing_Military_Press', 3, 8, 120],
        ['Bent_Over_Two-Dumbbell_Row', 3, 10, 90],
        ['Side_Lateral_Raise', 3, 15, 60],
        ['Barbell_Curl', 3, 12, 60],
        ['Triceps_Pushdown', 3, 12, 60]
      ]
    },
    {
      id: 'lower',
      name: 'Pierna',
      goal: 'Fuerza e hipertrofia',
      level: 'Intermedio',
      note: 'Mitad inferior del clásico Torso / Pierna, dos veces por semana.',
      days: ['Mar', 'Vie'],
      exercises: [
        ['Barbell_Deadlift', 4, 5, 180],
        ['Barbell_Squat', 4, 8, 150],
        ['Dumbbell_Lunges', 3, 12, 90],
        ['Barbell_Hip_Thrust', 3, 12, 90],
        ['Seated_Leg_Curl', 3, 12, 60],
        ['Standing_Calf_Raises', 4, 15, 45]
      ]
    },
    {
      id: 'casa',
      name: 'En casa sin material',
      goal: 'Mantenimiento',
      level: 'Principiante',
      note: 'Solo peso corporal. Ideal para viajes o días sin gimnasio. Las repeticiones de plancha son segundos.',
      days: ['Lun', 'Mié', 'Vie'],
      exercises: [
        ['Pushups', 4, 12, 60],
        ['Bodyweight_Squat', 4, 20, 60],
        ['Bodyweight_Walking_Lunge', 3, 12, 60],
        ['Bench_Dips', 3, 12, 60],
        ['Plank', 3, 45, 45],
        ['Mountain_Climbers', 3, 20, 45]
      ]
    },
    {
      id: 'fuerza',
      name: 'Fuerza 5x5',
      goal: 'Fuerza máxima',
      level: 'Intermedio',
      note: 'Los tres grandes básicos con series pesadas de 5. Sube 2,5 kg cada vez que completes todas las series.',
      days: ['Lun', 'Mié', 'Vie'],
      exercises: [
        ['Barbell_Squat', 5, 5, 180],
        ['Barbell_Bench_Press_-_Medium_Grip', 5, 5, 180],
        ['Bent_Over_Barbell_Row', 5, 5, 180],
        ['Barbell_Deadlift', 1, 5, 240]
      ]
    }
  ];

  /* Convierte una plantilla en una rutina editable del usuario */
  function toRoutine(tpl) {
    return {
      id: null,
      name: tpl.name,
      note: tpl.note,
      days: tpl.days.slice(),
      exercises: tpl.exercises
        .filter(function (row) { return Data.get(row[0]); })   // descarta IDs no disponibles
        .map(function (row) {
          return { exId: row[0], sets: row[1], reps: row[2], weight: 0, rest: row[3], note: '' };
        })
    };
  }

  /* Dónde hace falta entrenar para poder hacerla entera: se deduce del material
     de sus ejercicios, así no hay que mantenerlo a mano en cada plantilla. */
  const ORDEN_LUGARES = ['home', 'bands', 'dumbbell', 'gym'];

  function lugarNecesario(t) {
    for (let i = 0; i < ORDEN_LUGARES.length; i++) {
      const g2 = ORDEN_LUGARES[i];
      const cabe = t.exercises.every(function (e) {
        const ex = Data.get(e[0]);
        return ex && Data.gearAllows(g2, ex.equipment);
      });
      if (cabe) return g2;
    }
    return 'gym';
  }

  g.Templates = {
    lugarNecesario: lugarNecesario, list: TEMPLATES, toRoutine: toRoutine };
})(window);
