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
    },

    /* ---------- estiramientos, pilates y terapia ----------
       Van marcadas como movilidad para que se listen aparte: buscar la sesión
       de estiramientos entre las de fuerza era perderla. Todas se hacen con el
       peso del cuerpo, así que salen en cualquier sitio; en estas las
       repeticiones son segundos, como ya pasaba con la plancha. */
    {
      id: 'estiramiento',
      name: 'Estiramiento completo',
      tipo: 'movilidad',
      goal: 'Flexibilidad',
      level: 'Principiante',
      note: 'Para después de entrenar, con el músculo caliente. Las repeticiones son segundos y las dos series son un lado cada una. Sin rebotes: se entra hasta notar tensión, no dolor, y se respira.',
      days: ['Lun', 'Mié', 'Vie'],
      exercises: [
        ['Childs_Pose', 2, 30, 10],
        ['Worlds_Greatest_Stretch', 2, 30, 10],
        ['Kneeling_Hip_Flexor', 2, 30, 10],
        ['Seated_Floor_Hamstring_Stretch', 2, 30, 10],
        ['Lying_Glute', 2, 30, 10],
        ['Standing_Gastrocnemius_Calf_Stretch', 2, 30, 10],
        ['Spinal_Stretch', 2, 30, 10],
        ['Shoulder_Stretch', 2, 30, 10]
      ]
    },
    {
      id: 'movilidad',
      name: 'Movilidad para calentar',
      tipo: 'movilidad',
      goal: 'Calentamiento',
      level: 'Principiante',
      note: 'Diez minutos antes de tocar una barra. Movimiento suave y de recorrido creciente, sin quedarse quieto en ninguna posición: esto es para despertar la articulación, no para ganar flexibilidad.',
      days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      exercises: [
        ['Arm_Circles', 1, 20, 15],
        ['Shoulder_Circles', 1, 20, 15],
        ['Dynamic_Chest_Stretch', 1, 15, 15],
        ['Standing_Hip_Circles', 1, 15, 15],
        ['Groiners', 1, 12, 20],
        ['Inchworm', 1, 8, 20],
        ['Knee_Circles', 1, 15, 15],
        ['Ankle_Circles', 1, 15, 15]
      ]
    },
    {
      id: 'cuello-espalda',
      name: 'Cuello y espalda de oficina',
      tipo: 'movilidad',
      goal: 'Terapia',
      level: 'Principiante',
      note: 'Para la espalda cargada de estar sentado. Se puede hacer a media tarde y sin cambiarse de ropa. Si algo da un dolor agudo o baja por el brazo o la pierna, se para: eso lo mira un fisioterapeuta, no una app.',
      days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      exercises: [
        ['Chin_To_Chest_Stretch', 2, 20, 10],
        ['Side_Neck_Stretch', 2, 20, 10],
        ['Upper_Back_Stretch', 2, 30, 10],
        ['Middle_Back_Stretch', 2, 30, 10],
        ['Cat_Stretch', 2, 30, 10],
        ['Chair_Lower_Back_Stretch', 2, 30, 10],
        ['Standing_Pelvic_Tilt', 2, 20, 10],
        ['Hug_Knees_To_Chest', 2, 30, 10]
      ]
    },
    {
      id: 'rodillo',
      name: 'Rodillo miofascial',
      tipo: 'movilidad',
      goal: 'Recuperación',
      level: 'Principiante',
      note: 'Hace falta un rodillo de espuma. Se rueda despacio y, al dar con un punto sensible, se para ahí y se respira hasta que afloja. No lleva zona lumbar a propósito: ahí el rodillo no tiene nada donde apoyar y se acaba forzando la columna.',
      days: ['Mar', 'Jue', 'Sáb'],
      exercises: [
        ['Quadriceps-SMR', 1, 45, 15],
        ['Iliotibial_Tract-SMR', 1, 45, 15],
        ['Hamstring-SMR', 1, 45, 15],
        ['Piriformis-SMR', 1, 45, 15],
        ['Adductor', 1, 45, 15],
        ['Calves-SMR', 1, 45, 15],
        ['Peroneals-SMR', 1, 45, 15],
        ['Latissimus_Dorsi-SMR', 1, 45, 15],
        ['Rhomboids-SMR', 1, 45, 15]
      ]
    },
    {
      id: 'pilates-centro',
      name: 'Pilates: centro fuerte',
      tipo: 'movilidad',
      goal: 'Core y control',
      level: 'Principiante',
      note: 'Trabajo de suelo inspirado en pilates: control, respiración y lumbar pegada al suelo. Mejor pocas repeticiones bien hechas que muchas deprisa. En plancha y puente las repeticiones son segundos.',
      days: ['Mar', 'Jue', 'Sáb'],
      exercises: [
        ['Dead_Bug', 3, 10, 45],
        ['Plank', 3, 30, 45],
        ['Side_Bridge', 3, 20, 45],
        ['Bent-Knee_Hip_Raise', 3, 12, 45],
        ['Butt_Lift_Bridge', 3, 15, 45],
        ['Single_Leg_Glute_Bridge', 3, 10, 45],
        ['Scissor_Kick', 3, 20, 45],
        ['Stomach_Vacuum', 3, 15, 30]
      ]
    },
    {
      id: 'pilates-espalda',
      name: 'Pilates: espalda y cadera',
      tipo: 'movilidad',
      goal: 'Espalda sana',
      level: 'Principiante',
      note: 'La otra mitad: cadena posterior y cadera, en el suelo y sin material. Va bien en los días que no se entrena fuerte, o el día después de pierna.',
      days: ['Mié', 'Sáb'],
      exercises: [
        ['Pelvic_Tilt_Into_Bridge', 3, 12, 40],
        ['Superman', 3, 15, 40],
        ['Lower_Back_Curl', 3, 12, 40],
        ['Cat_Stretch', 2, 30, 20],
        ['One_Knee_To_Chest', 2, 30, 15],
        ['Knee_Across_The_Body', 2, 30, 15],
        ['Seated_Glute', 2, 30, 15],
        ['Hip_Circles_prone', 2, 15, 20]
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
