/* paises.js — de dónde es quien usa la app.

   No es un dato de forma física ni una preferencia: es lo que decide si el menú
   se puede comprar. «Judías verdes» son vainicas, ejotes, chauchas o porotos
   según dónde estés; el pescado barato de un sitio no existe en otro; y media
   lista de la compra de un menú español no está en un supermercado colombiano.
   Antes esto se deducía de la zona horaria del móvil, que acierta casi siempre
   pero calla cuando se equivoca. Preguntado, no se equivoca.

   La bandera no es adorno: en una lista de casi doscientos nombres es lo que
   permite encontrar el tuyo sin leer. Y sale del propio código ISO, sin
   imágenes que descargar ni servicio que pagar: las letras de ese código tienen
   su gemela en el bloque de indicadores regionales de Unicode, y dos de esas
   seguidas las pinta el sistema como la bandera. En un Android o un iPhone se
   ve la bandera; en algún Windows se ven las dos letras, que tampoco estorban. */
(function (g) {
  'use strict';

  /* Código ISO y nombre en español. En una sola cadena por país porque son
     doscientos: en objetos ocupaba cuatro veces más y se leía peor. */
  const LISTA = ('AF:Afganistán|AL:Albania|DE:Alemania|AD:Andorra|AO:Angola|' +
    'AG:Antigua y Barbuda|SA:Arabia Saudí|DZ:Argelia|AR:Argentina|AM:Armenia|' +
    'AU:Australia|AT:Austria|AZ:Azerbaiyán|BS:Bahamas|BD:Bangladés|BB:Barbados|' +
    'BH:Baréin|BE:Bélgica|BZ:Belice|BJ:Benín|BY:Bielorrusia|BO:Bolivia|' +
    'BA:Bosnia y Herzegovina|BW:Botsuana|BR:Brasil|BN:Brunéi|BG:Bulgaria|' +
    'BF:Burkina Faso|BI:Burundi|BT:Bután|CV:Cabo Verde|KH:Camboya|CM:Camerún|' +
    'CA:Canadá|QA:Catar|TD:Chad|CL:Chile|CN:China|CY:Chipre|VA:Ciudad del Vaticano|' +
    'CO:Colombia|KM:Comoras|CG:Congo|CD:Congo (RD)|KP:Corea del Norte|' +
    'KR:Corea del Sur|CI:Costa de Marfil|CR:Costa Rica|HR:Croacia|CU:Cuba|' +
    'DK:Dinamarca|DM:Dominica|EC:Ecuador|EG:Egipto|SV:El Salvador|AE:Emiratos Árabes Unidos|' +
    'ER:Eritrea|SK:Eslovaquia|SI:Eslovenia|ES:España|US:Estados Unidos|EE:Estonia|' +
    'SZ:Esuatini|ET:Etiopía|PH:Filipinas|FI:Finlandia|FJ:Fiyi|FR:Francia|GA:Gabón|' +
    'GM:Gambia|GE:Georgia|GH:Ghana|GD:Granada|GR:Grecia|GT:Guatemala|GN:Guinea|' +
    'GQ:Guinea Ecuatorial|GW:Guinea-Bisáu|GY:Guyana|HT:Haití|HN:Honduras|HU:Hungría|' +
    'IN:India|ID:Indonesia|IQ:Irak|IR:Irán|IE:Irlanda|IS:Islandia|' +
    'MH:Islas Marshall|SB:Islas Salomón|IL:Israel|IT:Italia|JM:Jamaica|JP:Japón|' +
    'JO:Jordania|KZ:Kazajistán|KE:Kenia|KG:Kirguistán|KI:Kiribati|KW:Kuwait|LA:Laos|' +
    'LS:Lesoto|LV:Letonia|LB:Líbano|LR:Liberia|LY:Libia|LI:Liechtenstein|LT:Lituania|' +
    'LU:Luxemburgo|MK:Macedonia del Norte|MG:Madagascar|MY:Malasia|MW:Malaui|' +
    'MV:Maldivas|ML:Malí|MT:Malta|MA:Marruecos|MU:Mauricio|MR:Mauritania|MX:México|' +
    'FM:Micronesia|MD:Moldavia|MC:Mónaco|MN:Mongolia|ME:Montenegro|MZ:Mozambique|' +
    'MM:Birmania|NA:Namibia|NR:Nauru|NP:Nepal|NI:Nicaragua|NE:Níger|NG:Nigeria|' +
    'NO:Noruega|NZ:Nueva Zelanda|OM:Omán|NL:Países Bajos|PK:Pakistán|PW:Palaos|' +
    'PS:Palestina|PA:Panamá|PG:Papúa Nueva Guinea|PY:Paraguay|PE:Perú|PL:Polonia|' +
    'PT:Portugal|PR:Puerto Rico|GB:Reino Unido|CF:República Centroafricana|' +
    'CZ:República Checa|DO:República Dominicana|RW:Ruanda|RO:Rumanía|RU:Rusia|' +
    'WS:Samoa|KN:San Cristóbal y Nieves|SM:San Marino|VC:San Vicente y las Granadinas|' +
    'LC:Santa Lucía|ST:Santo Tomé y Príncipe|SN:Senegal|RS:Serbia|SC:Seychelles|' +
    'SL:Sierra Leona|SG:Singapur|SY:Siria|SO:Somalia|LK:Sri Lanka|ZA:Sudáfrica|' +
    'SD:Sudán|SS:Sudán del Sur|SE:Suecia|CH:Suiza|SR:Surinam|TH:Tailandia|' +
    'TZ:Tanzania|TJ:Tayikistán|TL:Timor Oriental|TG:Togo|TO:Tonga|' +
    'TT:Trinidad y Tobago|TN:Túnez|TM:Turkmenistán|TR:Turquía|TV:Tuvalu|UA:Ucrania|' +
    'UG:Uganda|UY:Uruguay|UZ:Uzbekistán|VU:Vanuatu|VE:Venezuela|VN:Vietnam|YE:Yemen|' +
    'DJ:Yibuti|ZM:Zambia|ZW:Zimbabue').split('|').map(function (x) {
      const i = x.indexOf(':');
      return { iso: x.slice(0, i), nombre: x.slice(i + 1) };
    });

  /* Las dos letras del ISO, convertidas a sus indicadores regionales. El
     sistema operativo junta los dos y pinta la bandera. */
  function bandera(iso) {
    const c = String(iso || '').toUpperCase();
    if (!/^[A-Z]{2}$/.test(c)) return '';
    try {
      return String.fromCodePoint(
        0x1F1E6 + c.charCodeAt(0) - 65,
        0x1F1E6 + c.charCodeAt(1) - 65
      );
    } catch (e) { return c; }
  }

  /* ---------- el nombre, en el idioma de la app ----------
     La lista de arriba está en español. En vez de escribirla otra vez en
     inglés, se le pregunta al navegador: Intl.DisplayNames saca el nombre de
     un país a partir de su ISO en el idioma que se le pida, y lo trae él, no
     nosotros. Si no lo tiene —o si devuelve el propio código, que es lo que
     hace cuando no conoce ese país— se usa el nombre escrito a mano.

     Se guarda lo resuelto porque esto se llama una vez por país cada vez que
     se pinta la lista, y son doscientos. */
  const cache = {};
  let cacheIdioma = null;

  function nombreEnIdioma(iso, escrito) {
    const id = (g.Idioma && g.Idioma.actual()) || 'es';
    if (id === 'es') return escrito;
    if (cacheIdioma !== id) { cacheIdioma = id; for (const k in cache) delete cache[k]; }
    if (cache[iso]) return cache[iso];
    let n = escrito;
    try {
      const dn = new Intl.DisplayNames([id], { type: 'region' });
      const r = dn.of(iso);
      if (r && r !== iso) n = r;
    } catch (e) { /* navegador sin Intl.DisplayNames: se queda el escrito */ }
    cache[iso] = n;
    return n;
  }

  /* Lo que se pinta y sobre lo que se busca. La lista cruda no se toca: su
     `nombre` es la clave estable con la que se guarda el país elegido. */
  function conNombre(x) {
    return { iso: x.iso, nombre: nombreEnIdioma(x.iso, x.nombre) };
  }

  function porIso(iso) {
    const c = String(iso || '').toUpperCase();
    return LISTA.filter(function (x) { return x.iso === c; })[0] || null;
  }

  function nombreDe(iso) {
    const p = porIso(iso);
    return p ? nombreEnIdioma(p.iso, p.nombre) : '';
  }

  /* Buscar sin tildes y sin mayúsculas: quien escribe «panama» con el teclado
     de prisa espera encontrar Panamá, y quien escribe «republica» espera las
     dos repúblicas. */
  function plano(t) {
    const s = String(t || '').toLowerCase();
    if (!s.normalize) return s;
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function buscar(texto) {
    const q = plano(texto).trim();
    /* La lista viene ordenada alfabeticamente en español, y en inglés eso deja
       Germany entre Albania y Andorra. Se reordena por el nombre que se lee. */
    if (!q) {
      const todos = LISTA.map(conNombre);
      const id = (g.Idioma && g.Idioma.actual()) || 'es';
      if (id !== 'es') {
        todos.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, id); });
      }
      return todos;
    }
    /* Los que empiezan por lo escrito, primero: buscando «per» interesa más
       Perú que Liberia, aunque las dos lo contengan.

       Se busca sobre los DOS nombres, el de la app y el escrito en español:
       con la app en inglés, quien teclea «España» tiene que encontrar Spain. */
    const empiezan = [];
    const contienen = [];
    LISTA.forEach(function (x) {
      const y = conNombre(x);
      const n = plano(y.nombre);
      const otro = plano(x.nombre);
      if (n.indexOf(q) === 0 || otro.indexOf(q) === 0) empiezan.push(y);
      else if (n.indexOf(q) !== -1 || otro.indexOf(q) !== -1) contienen.push(y);
    });
    return empiezan.concat(contienen);
  }

  /* Lo que el móvil ya sabe, para proponerlo la primera vez. No se guarda solo:
     se ofrece, y quien elige es la persona. Adivinar y dar por hecho es justo
     lo que hacía la versión anterior de esto. */
  function sugerido() {
    let zona = '';
    try { zona = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { zona = ''; }
    const ciudad = zona.split('/').pop().replace(/_/g, ' ');
    if (ciudad) {
      const porCiudad = {
        'Bogota': 'CO', 'Mexico City': 'MX', 'Madrid': 'ES', 'Lima': 'PE',
        'Santiago': 'CL', 'Buenos Aires': 'AR', 'Caracas': 'VE', 'Guayaquil': 'EC',
        'Quito': 'EC', 'La Paz': 'BO', 'Asuncion': 'PY', 'Montevideo': 'UY',
        'Panama': 'PA', 'San Jose': 'CR', 'Guatemala': 'GT', 'Tegucigalpa': 'HN',
        'Managua': 'NI', 'El Salvador': 'SV', 'Havana': 'CU', 'Santo Domingo': 'DO',
        'Puerto Rico': 'PR'
      };
      if (porCiudad[ciudad]) return porCiudad[ciudad];
    }
    /* Del idioma solo se saca el país cuando el idioma lo lleva escrito
       («es-CO»); «es» a secas no dice de dónde es nadie. */
    let idioma = '';
    try { idioma = navigator.language || ''; } catch (e) { idioma = ''; }
    const m = idioma.match(/[-_]([A-Za-z]{2})$/);
    if (m && porIso(m[1])) return m[1].toUpperCase();
    return '';
  }

  g.Paises = {
    LISTA: LISTA, bandera: bandera, porIso: porIso, nombreDe: nombreDe,
    buscar: buscar, sugerido: sugerido
  };
})(window);
