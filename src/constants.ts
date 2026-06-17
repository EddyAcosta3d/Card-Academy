import { Card, Challenge, SubjectTopics, Grade, Pack, Year } from './types';

export const ACADEMIC_CONTENT: Record<Year, SubjectTopics[]> = {
  '1': [
    {
      id: 'esp_1',
      name: 'Español',
      icon: 'Book',
      topics: [{
        id: 't_esp_1',
        name: 'Literatura y Lenguaje',
        tasks: [
          { id: 'task_esp_1_basic', title: 'Quiz IA: Lenguaje', description: 'Evaluación automática sobre conceptos base.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_esp_1_inter', title: 'Análisis de Cuentos', description: 'Identifica la estructura narrativa en tu libreta.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Elige tu cuento breve favorito o uno de tu libro de texto de Español.\n2. En tu libreta, dibuja una tabla con 3 columnas tituladas: Inicio, Desarrollo (Nudo) y Final (Desenlace).\n3. Escribe de 2 a 3 renglones en cada columna explicando qué ocurre en esa parte de la historia con letra clara y buena ortografía.\n4. Firma tu página abajo con tu nombre completo y fecha escolar.\n5. Toma una foto nítida de tu libreta de frente y súbela aquí para que tu profesor la apruebe.' },
          { id: 'task_esp_1_hard', title: 'Crónica Literaria', description: 'Escribe una crónica sobre un evento escolar.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Elige un evento emocionante de tu escuela Jacobo (como el Día de Muertos, un partido del recreo, o tu primer día de secundaria).\n2. En tu libreta, escribe una crónica detallada de 1 página narrando paso a paso qué pasó al inicio, durante el desarrollo de la fiesta, y cómo concluyó.\n3. Añade descripciones de los colores, los sonidos y cómo te sentías.\n4. Dibuja abajo un pequeño boceto que ilustre la mejor escena del día.\n5. Asegúrate de que tu letra sea legible y las palabras estén bien escritas. Sube una foto de tu escrito terminado.' }
        ]
      }]
    },
    {
      id: 'mat_1',
      name: 'Matemáticas',
      icon: 'Calculator',
      topics: [{
        id: 't_mat_1',
        name: 'Números y Medida',
        tasks: [
          { id: 'task_mat_1_basic', title: 'Quiz IA: Aritmética', description: 'Prueba de agilidad mental matemática.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_mat_1_inter', title: 'Proporciones Reales', description: 'Calcula escalas en un mapa real.', difficulty: 'Medium', type: 'Quiz', quizOptions: ['1:100', '1:500', '1:1000', '1:50'], quizAnswer: 1, reward: { tokens: 50 } },
          { id: 'task_mat_1_hard', title: 'Arquitectura Geométrica', description: 'Diseña un sólido platónico.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Con ayuda de una regla y lápiz, dibuja el desarrollo plano (plantilla completa) para armar un cubo o un prisma triangular en tu cuaderno o en una hoja blanca.\n2. No olvides agregar las pestañas a los costados de cada cara para poder unirlas.\n3. Recorta la figura y ármala usando pegamento, masking o cinta adhesiva.\n4. Si no cuentas con tijeras, dibuja detalladamente el cuerpo geométrico en 3D en tu libreta, sombreando cada una de sus caras con colores distintos.\n5. Sube una foto sosteniendo tu sólido tridimensional o mostrando tu dibujo coloreado.' }
        ]
      }]
    },
    {
      id: 'his_1',
      name: 'Historia',
      icon: 'Globe',
      topics: [{
        id: 't_his_1',
        name: 'Civilizaciones',
        tasks: [
          { id: 'task_his_1_basic', title: 'Quiz IA: Historia Universal', description: 'Conceptos clave de la antigüedad.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_his_1_inter', title: 'Línea de Vida', description: 'Compara dos civilizaciones clásicas.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Traza una línea vertical en medio de una hoja de tu libreta para formar dos columnas: una para el Imperio Romano y otra para el Antiguo Egipto.\n2. En cada columna escribe 3 datos históricos súper importantes de cada civilización (por ejemplo: sus grandes construcciones, su río principal, qué comerciaban o sus dioses).\n3. Haz un dibujo pequeño al final de cada columna representativo (por ejemplo: el Coliseo Romano y una Esfinge de Egipto).\n4. Sube una foto completa de la página de tu cuaderno de frente.' },
          { id: 'task_his_1_hard', title: 'Ensayo sobre Imperios', description: 'Impacto de la caída de Roma en la vida actual.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Repasa en tu libro de Historia qué ocurrió en Europa de forma cotidiana tras la caída del Imperio Romano en el año 476 d.C.\n2. Redacta un escrito explicativo de 3 párrafos en tu cuaderno:\n   - Párrafo 1: ¿Por qué colapsó el imperio y qué pasó con las ciudades?\n   - Párrafo 2: ¿Cómo cambió la vida escolar y familiar en la Edad Media?\n   - Párrafo 3: ¿Qué invento de Roma (como el calendario, la arquitectura o las leyes) consideras que sigue ayudando más en México hoy?\n3. Escribe tu nombre grande arriba de la página, tómale foto y súbela.' }
        ]
      }]
    },
    {
      id: 'bio_1',
      name: 'Biología',
      icon: 'Activity',
      topics: [{
        id: 't_bio_1',
        name: 'Seres Vivos',
        tasks: [
          { id: 'task_bio_1_basic', title: 'Quiz IA: Células', description: 'Fundamentos de la vida.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_bio_1_inter', title: 'Cadena Alimenticia', description: 'Dibuja un ecosistema local.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Piensa en la fauna y plantas típicas de tu región (como el desierto de Sinaloa, el campo, o el cerro más cercano).\n2. En una página de tu libreta, dibuja una cadena alimenticia clara utilizando flechas que unan a los siguientes participantes:\n   - Un productor (ej. planta o pasto mexicano)\n   - Un consumidor primario (ej. chapulín, conejo o grillo)\n   - Un consumidor secundario (ej. lagartija, coyote o halcón)\n3. Colorea bien cada dibujo y rotula sus nombres abajo de cada ser vivo.\n4. Sube una foto con buena definición para que tu maestro pueda revisarlo.' },
          { id: 'task_bio_1_hard', title: 'Proyecto Herbario', description: 'Colecciona y clasifica 5 hojas de tu calle.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Sal al patio de tu casa, a tu banqueta, o al jardín de la escuela de día y recoge 5 hojas de plantas o árboles caídas en el piso.\n2. Pégalas ordenadamente con cinta o pegamento en una hoja de tu cuaderno.\n3. Al lado de cada hoja, anota sus características observables: ¿Cómo es su contorno (con piquitos, liso, de sierra)?, ¿Qué color tiene?, y ¿Cómo se llama el árbol si lo conoces?\n4. Si no puedes conseguir hojas reales, dibuja con lujo de detalles 5 hojas en tu libreta y clasifícalas igual.\n5. Sube una foto clara de tu página de herbario.' }
        ]
      }]
    },
    {
      id: 'tec_1',
      name: 'Tecnología',
      icon: 'Cpu',
      topics: [{
        id: 't_tec_1',
        name: 'Sistemas Técnicos',
        tasks: [
          { id: 'task_tec_1_basic', title: 'Quiz IA: Herramientas', description: 'Identificación de funciones.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_tec_1_inter', title: 'Diagrama de Procesos', description: 'Dibuja el flujo de un servicio cotidiano.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Selecciona un servicio o tarea técnica simple que uses en casa (como la ruta para hacer tortillas, cómo prender la estufa de gas de forma segura o los pasos para lavarse las manos en la escuela).\n2. En tu libreta, dibuja un diagrama usando flechas y cajas secuenciales para detallar el flujo exacto de pasos ordenadamente.\n3. Añade colores para distinguir el inicio, las acciones intermedias, e indica los puntos donde se debe tener cuidado (ej. apagar el gas).\n4. Sube una foto completa de tu diagrama de flujo.' },
          { id: 'task_tec_1_hard', title: 'Prototipo de Madera o Cartón', description: 'Construye un objeto funcional reciclado.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Diseña y construye un soporte para tu celular, tableta o u organizador escolar para tus lápices utilizando únicamente materiales de desecho del hogar (como cartón, cilindros de papel higiénico, envases vacíos limpios o retazos de madera).\n2. El objeto debe ser estable y cumplir su función sin desarmarse.\n3. Decóralo a tu gusto usando crayolas, colores, marcadores o pintura.\n4. Sube una foto presumiendo tu prototipo terminado de frente.' }
        ]
      }]
    },
    {
      id: 'fce_1',
      name: 'Formación Cívica y Ética',
      icon: 'Users',
      topics: [{
        id: 't_fce_1',
        name: 'Identidad y Valores',
        tasks: [
          { id: 'task_fce_1_basic', title: 'Quiz IA: Valores', description: 'Reconoce valores universales.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_fce_1_inter', title: 'Derechos del Niño', description: 'Identifica 5 derechos fundamentales escolares.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. En tu cuaderno, haz un listado decorado de los 5 derechos de los niños y adolescentes que consideres de mayor importancia en tu escuela y hogar.\n2. Junto a cada derecho seleccionado, redacta un renglón indicando un ejemplo práctico de cómo se puede cumplir en tu vida para apoyar a otros.\n3. Usa tinta legible y dale un diseño creativo de márgenes.\n4. Sube la foto del escrito.' },
          { id: 'task_fce_1_hard', title: 'Proyecto Comunitario', description: 'Propón una mejora para tu colonia.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Imagina que te eligen líder vecinal o presidente escolar.\n2. Escribe una carta formal de media cuartilla dirigida al gobierno de tu alcaldía o al director del plantel escolar solicitando una mejora que beneficie a todos.\n3. Describe:\n   - ¿Cuál es la problemática urgente? (ej. baches, luminarias rotas, falta de botes de basura)\n   - ¿Cuál es tu propuesta detallada de solución económica?\n   - ¿Cómo ayudará esto a todos los vecinos o compañeros?\n4. Termina la carta con tu nombre grande, firma y fecha. ¡Súbela para aprobación!' }
        ]
      }]
    },
    {
      id: 'geo_1',
      name: 'Geografía',
      icon: 'MapPin',
      topics: [{
        id: 't_geo_1',
        name: 'Espacio Geográfico',
        tasks: [
          { id: 'task_geo_1_basic', title: 'Quiz IA: Mapas', description: 'Coordenadas y proyecciones.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_geo_1_inter', title: 'Relieve Regional', description: 'Identifica montañas cercanas y clima regional.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Investiga o repasa con tu maestro de Geografía cuáles son los accidentes del relieve más representativos en tu estado o municipio de México (montañas, cerros, valles, ríos o lagos).\n2. En tu libreta anota el nombre de la elevación o río más cercano a tu colonia (como el Cerro de la Silla, el río Culiacán, etc.).\n3. Anota: ¿Cuál es su clima dominante? y ¿Por qué es importante conservarlo limpio?\n4. Añade un dibujo coloreado del relieve en tu cuaderno y súbelo aquí.' },
          { id: 'task_geo_1_hard', title: 'Planisferio Político', description: 'Ubica los 10 países con más población mundial.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Consigue un mapa planisferio básico sin nombres o dibuja en una página completa de tu cuaderno un esquema simple de la silueta de los continentes.\n2. En tu mapa, ubica coloreando y colocando números del 1 al 10 las naciones con mayor número de habitantes del planeta entero.\n3. En la parte de abajo de tu mapa, escribe de forma ordenada de mayor a menor el nombre de estos 10 países.\n4. Sube la foto del mapa coloreado y clasificado.' }
        ]
      }]
    },
    {
      id: 'ing_1',
      name: 'Inglés',
      icon: 'Languages',
      topics: [{
        id: 't_ing_1',
        name: 'Basic Grammar',
        tasks: [
          { id: 'task_ing_1_basic', title: 'AI Quiz: Verb To Be', description: 'Subject pronouns and am/is/are.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 }, instructions: 'Usa la IA para generar y responder un cuestionario interactivo en inglés sobre los pronombres personales y el uso correcto de am/is/are.' },
          { id: 'task_ing_1_inter', title: 'Introductions', description: 'Write a self-introduction (50 words).', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: 'Escribe una autopresentación en inglés de al menos 50 palabras en tu libreta. Debes incluir tu nombre, edad, de dónde eres y tus pasatiempos favoritos. Toma una foto clara de tu escrito y súbela como evidencia.' },
          { id: 'task_ing_1_hard', title: 'Short Story', description: 'Write a 100-word daily routine.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: 'Escribe un breve texto de 100 palabras describiendo tu rutina diaria en inglés (tus actividades desde que te levantas hasta que te duermes) utilizando el presente simple. Toma una foto de tu escrito y súbela aquí.' }
        ]
      }]
    },
    {
      id: 'art_1',
      name: 'Artes',
      icon: 'Palette',
      topics: [{
        id: 't_art_1',
        name: 'Artes Visuales',
        tasks: [
          { id: 'task_art_1_basic', title: 'Quiz IA: Color', description: 'Círculo cromático básico.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_art_1_inter', title: 'Puntillismo', description: 'Crea una obra usando solo puntos de colores.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Dibuja de manera muy tenue con lápiz la silueta de un animal, flor o fruta en tu cuaderno.\n2. Usando solamente marcadores de colores, plumas o lápices de colores bien afilados, colorea el interior rellenándolo ÚNICAMENTE con puntos. No se vale hacer líneas continuas o pintar como siempre.\n3. Explora poner puntos más juntos en las zonas de sombra y más separados para dar luz.\n4. Sube la foto del dibujo terminado de cerca.' },
          { id: 'task_art_1_hard', title: 'Escultura Reciclada', description: 'Usa cartón para crear un animal tridimensional.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Reutiliza el cartón de alguna caja de cereal, de huevos o rollos de papel sanitario para fabricar tu figura favorita.\n2. Recorta piezas encajables o únelas con pegamento escolar para que tu animalito de juguete se mantenga firme por sí solo sobre la mesa o tu pupitre.\n3. Coloréalo, píntalo o adórnalo creativamente usando marcas de plumas o retazos de periódico.\n4. Sube la foto de la escultura junto a tu libreta donde se observe tu proceso de manualidad.' }
        ]
      }]
    },
    {
      id: 'int_cur_1',
      name: 'Integración Curricular',
      icon: 'LayoutGrid',
      topics: [{
        id: 't_int_cur_1',
        name: 'Transversalidad',
        tasks: [
          { id: 'task_int_cur_1_basic', title: 'Reto Integrador', description: 'Propón una solución que use 2 materias.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_int_cur_1_inter', title: 'Proyecto de Vida', description: 'Mapa mental de tus metas escolares actuales.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. En el centro de una página de tu cuaderno, dibuja un círculo coloreado que diga "Mis Metas Escolares" o una caricatura tuya escolar.\n2. Traza 4 ramas o flechas de diferentes colores hacia los lados indicando metas precisas para este año (ej. aprender inglés, participar más en matemáticas, entregar todas las tareas o jugar más sano en el recreo).\n3. Para cada objetivo, escribe debajo una acción clara que harás en la semana.\n4. Sube una foto legible de tu mapa mental personalizado.' },
          { id: 'task_int_cur_1_hard', title: 'Feria de Ciencias', description: 'Presenta un experimento integral casero.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Diseña un experimento físico o químico clásico y súper seguro con materiales de cocina (como un volcán de bicarbonato y vinagre, el experimento de la pimienta y el jabón, o la lámpara de lava casera).\n2. Ejecuta el experimento con supervisión o ayuda de tu familia.\n3. En tu cuaderno escribe: el nombre del experimento, la lista de materiales, los pasos que seguiste y qué reacción científica ocurrió.\n4. Sube una foto de tu experimento reaccionando al lado de tu cuaderno con tus apuntes legibles.' }
        ]
      }]
    }
  ],
  '2': [
    {
      id: 'esp_2',
      name: 'Español',
      icon: 'Book',
      topics: [{
        id: 't_esp_2',
        name: 'Comunicación',
        tasks: [
          { id: 'task_esp_2_basic', title: 'Quiz IA: Géneros', description: 'Identifica tipos de texto.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_esp_2_inter', title: 'Debate Estructurado', description: 'Prepara argumentos para un tema.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_esp_2_hard', title: 'Antología Poética', description: 'Crea una colección de poemas propios.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. En una página limpia de tu libreta, escribe una mini-antología compuesta por 3 poemas originales escritos por ti.\n2. Cada poema debe tener al menos 2 estrofas con 4 versos cada una, y tratar sobre temas importantes para ti (tu familia, amigos, la escuela Jacobo o tu ciudad).\n3. Revisa la rima y el ritmo poético de cada estrofa.\n4. Para darle un toque de libro real, decora los márgenes de cada poema con dibujos sencillos relacionados con el tema de tus versos.\n5. Sube una foto a color de tu antología escrita.' }
        ]
      }]
    },
    {
      id: 'mat_2',
      name: 'Matemáticas',
      icon: 'Calculator',
      topics: [{
        id: 't_mat_2',
        name: 'Álgebra y Funciones',
        tasks: [
          { id: 'task_mat_2_basic', title: 'Quiz IA: Ecuaciones', description: 'Resolución rápida de primer grado.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_mat_2_inter', title: 'Gráficas Lineales', description: 'Interpreta puntos de equilibrio.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_mat_2_hard', title: 'Modelado Financiero', description: 'Simula intereses bancarios.', difficulty: 'Hard', type: 'Quiz', quizOptions: ['Interés Simple', 'Interés Compuesto', 'Amortización', 'Tasa Cero'], quizAnswer: 1, reward: { tokens: 150, pack: true } }
        ]
      }]
    },
    {
      id: 'his_2',
      name: 'Historia',
      icon: 'Globe',
      topics: [{
        id: 't_his_2',
        name: 'Historia de México I',
        tasks: [
          { id: 'task_his_2_basic', title: 'Quiz IA: Independencia', description: 'Personajes y fechas clave.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_his_2_inter', title: 'Mapa de Virreinatos', description: 'Dibuja la división territorial.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. En tu libreta, calca o dibuja un mapa básico de la República Mexicana.\n2. Identifica y colorea con colores contrastantes el área que correspondía al Virreinato de la Nueva España durante el siglo XVII.\n3. Señala y escribe los nombres de las 3 ciudades mineras más importantes de dicho periodo (Zacatecas, Guanajuato y Taxco) dibujando un pequeño pico de minería sobre ellas.\n4. Escribe abajo un título formal en letra de molde.\n5. Sube una foto nítida de tu mapa de frente.' },
          { id: 'task_his_2_hard', title: 'Ensayo Reformas Borbónicas', description: 'Impacto en la Nueva España.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Investiga en tu libro cómo afectaron las medidas económicas españolas (reformas borbónicas) a las clases populares e indígenas en el siglo XVIII.\n2. Escribe una redacción crítica de media cuartilla (un párrafo introductorio, uno de desarrollo y otro de conclusión) en tu libreta analizando cómo el enojo por la subida de impuestos preparó el camino para la lucha por la Independencia.\n3. Asegúrate de cuidar los acentos e incluir tu nombre completo en la parte de arriba.\n4. Sube la foto del ensayo escolar.' }
        ]
      }]
    },
    {
      id: 'fis_2',
      name: 'Física',
      icon: 'Zap',
      topics: [{
        id: 't_fis_2',
        name: 'Cinemática',
        tasks: [
          { id: 'task_fis_2_basic', title: 'Quiz IA: Velocidad', description: 'Calculos directos m/s.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_fis_2_inter', title: 'Experimento de Caída Libre', description: 'Cronometra un objeto.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Consigue dos hojas de papel idénticas. Arruga una de ellas con tus manos para formar una bola sólida y deja la otra hoja completamente lisa.\n2. Sostén ambos papeles a la misma altura y déjalos caer al mismo tiempo.\n3. En tu libreta escribe:\n   - ¿Cuál llegó al piso primero?\n   - Si las dos pesan exactamente lo mismo, ¿cómo influyó la resistencia y forma frente al aire?\n4. Coloca la bola de papel y la hoja lisa encima de tus apuntes y tómales una foto clara para subirla como evidencia.' },
          { id: 'task_fis_2_hard', title: 'Cohete de Aire', description: 'Lanzamiento y cálculo parabólico.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Construye un cohete miniatura muy ligero enrollando papel de reúso y poniéndole un cono en la punta.\n2. Idea un eyector casero: puede ser soplando fuertemente a través de un popote largo introducido en el cohete, o aplastando súbitamente una botella de plástico vacía conectada al popote.\n3. Lánzalo horizontalmente 3 veces y mide aproximadamente la distancia máxima que avanzó en el aire en metros.\n4. En tu cuaderno dibuja el cohete, traza con línea punteada su trayectoria curva (parábola) y anota los metros de cada lanzamiento.\n5. Sube una foto de tu cohete hecho en casa y los apuntes de vuelo.' }
        ]
      }]
    },
    {
      id: 'tec_2',
      name: 'Tecnología',
      icon: 'Cpu',
      topics: [{
        id: 't_tec_2',
        name: 'Informática',
        tasks: [
          { id: 'task_tec_2_basic', title: 'Quiz IA: Algoritmos', description: 'Lógica de programación básica.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_tec_2_inter', title: 'Página Web Simple', description: 'Maquetado en papel de una web.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_tec_2_hard', title: 'Base de Datos', description: 'Diseña el inventario de la escuela.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Imagina que eres el encargado de organizar el inventario del salón de clases o de la tienda de la escuela.\n2. En tu libreta, dibuja una tabla con las columnas: Identificador (ID), Nombre del Artículo, Categoría, Precio de Venta y Cantidad Disponible.\n3. Registra detalladamente al menos 10 registros reales o supuestos (como cuadernos, gomas, refrescos, frituras, etc.).\n4. Abajo de la tabla, escribe las instrucciones para realizar una venta imaginaria que descuente una pieza del stock.\n5. Sube una foto nítida de tu base de datos escrita en papel.' }
        ]
      }]
    },
    {
      id: 'fce_2',
      name: 'Formación Cívica y Ética',
      icon: 'Users',
      topics: [{
        id: 't_fce_2',
        name: 'Estado de Derecho',
        tasks: [
          { id: 'task_fce_2_basic', title: 'Quiz IA: Constitución', description: 'Artículos básicos.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_fce_2_inter', title: 'Juez por un Día', description: 'Resuelve un caso ético escolar.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_fce_2_hard', title: 'Debate Democrático', description: 'Participa en un foro virtual.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Reflexionemos con honestidad sobre un tema de mucha actualidad escolar: ¿Se debe permitir que los alumnos traigan y usen celulares dentro del salón durante las clases?\n2. En tu cuaderno, traza dos columnas: "Argumentos a Favor" (mínimo 3 ideas de cómo ayuda a aprender) y "Argumentos en Contra" (mínimo 3 ideas de cómo distrae o causa desunión).\n3. En los renglones finales redacta una pequeña opinión en donde expliques cuál es tu conclusión personal.\n4. Toma una foto con buena luz de tu análisis detallado en tu libreta y compártela.' }
        ]
      }]
    },
    {
      id: 'ing_2',
      name: 'Inglés',
      icon: 'Languages',
      topics: [{
        id: 't_ing_2',
        name: 'Past Events',
        tasks: [
          { id: 'task_ing_2_basic', title: 'AI Quiz: Past Simple', description: 'Regular and irregular verbs.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 }, instructions: 'Resuelve este examen rápido interactivo de opción múltiple enfocado en diferenciar y usar correctamente los verbos regulares e irregulares en pasado simple en inglés.' },
          { id: 'task_ing_2_inter', title: 'Biography', description: 'Write a bio of an explorer (80 words).', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: 'Elige a un explorador o personaje histórico famoso y escribe su biografía de al menos 80 palabras en inglés, usando el pasado simple para narrar sus logros y viajes. Sube la foto de tu apunte como evidencia.' },
          { id: 'task_ing_2_hard', title: 'Travel Vlog', description: 'Record a video about your last trip.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: 'Graba un video corto (máximo 1-2 minutos) explicándonos en inglés qué hiciste en tus últimas vacaciones o en un viaje reciente. Practica tu pronunciación y fluidez. Sube el video o un audio con tu presentación.' }
        ]
      }]
    },
    {
      id: 'art_2',
      name: 'Artes',
      icon: 'Palette',
      topics: [{
        id: 't_art_2',
        name: 'Danza y Cuerpo',
        tasks: [
          { id: 'task_art_2_basic', title: 'Quiz IA: Danza Folklore', description: 'Ritmos regionales de México.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_art_2_inter', title: 'Coreografía Corta', description: '30 segundos de baile libre.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Escucha una cancion tradicional, folclórica o tu tema bailable sano preferido.\n2. Diseña una rutina de baile corta de 30 segundos usando movimientos alegres de pies y brazos.\n3. En tu cuaderno, escribe la lista ordenada de tus movimientos coreográficos (ej. Paso 1: inicio con palmas, Paso 2: zapateado cruzado, Paso 3: vuelta a la izquierda, etc.).\n4. Puedes grabar un video de tu baile o subir la foto de la rutina detallada escribiendo también un dibujo sencillo de un bailarín en acción.' },
          { id: 'task_art_2_hard', title: 'Vestuario Ancestral', description: 'Dibuja y explica un traje típico.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Elige una vestimenta típica de un estado de México (como el traje de Chiapaneca, el de Charro, el huipil de Oaxaca, o el de Venado en Sonora).\n2. Dibuja a color en una hoja entera de tu cuaderno este hermoso vestuario con todos sus detalles.\n3. Señala con flechas qué representan sus colores, las flores bordadas o accesorios tradicionales.\n4. Escribe abajo en 3 renglones cuándo se suele portar este traje.\n5. Sube tu imagen.' }
        ]
      }]
    },
    {
      id: 'int_cur_2',
      name: 'Integración Curricular',
      icon: 'LayoutGrid',
      topics: [{
        id: 't_int_cur_2',
        name: 'Transversalidad',
        tasks: [
          { id: 'task_int_cur_2_basic', title: 'Reto Integrador', description: 'Propón una solución que use 2 materias.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_int_cur_2_inter', title: 'Proyecto de Vida', description: 'Mapa mental de tus metas escolares.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. En tu libreta, dibuja una silueta simple de tu rostro mirando al frente, rodeada por las metas profesionales u oficios que te encantaría ejercer cuando seas un adulto (ej. médico, ingeniera, maestro, diseñadora, etc.).\n2. Conecta cada profesión con 2 valores humanos primordiales (como empatía, esfuerzo, disciplina o paciencia) que necesitarás ejercer para triunfar en tu trabajo.\n3. Redacta abajo una frase que te inspire a seguir estudiando diariamente.\n4. Sube la foto del mapa.' },
          { id: 'task_int_cur_2_hard', title: 'Feria de Ciencias', description: 'Presenta un experimento integral.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Con cajitas, tubos de cartón, botellas limpias o tapas recicladas que tengas a la mano, planea y ensambla una maqueta a escala de tu "Salón de Clases del Futuro".\n2. Tu maqueta debe prever la comodidad de los estudiantes: buena ventilación, luz ecológica de día, botes para separar basura y tecnología útil.\n3. Si no consigues materiales, dibuja el plano técnico completo de este salón soñado con regla a color en tu libreta.\n4. Sube la foto del proyecto.' }
        ]
      }]
    }
  ],
  '3': [
    {
      id: 'esp_3',
      name: 'Español',
      icon: 'Book',
      topics: [{
        id: 't_esp_3',
        name: 'Análisis Crítico',
        tasks: [
          { id: 'task_esp_3_basic', title: 'Quiz IA: Publicidad', description: 'Analiza mensajes persuasivos.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_esp_3_inter', title: 'Guion Dramático', description: 'Escribe una escena de teatro.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_esp_3_hard', title: 'Proyecto Editorial', description: 'Diseña una revista escolar.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Diseña un formato para la portada de una revista escolar en tu libreta.\n2. Escribe a mano el artículo principal (mínimo 2 párrafos) sobre un suceso emocionante en la Escuela Jacobo (puede ser un triunfo deportivo, una iniciativa verde, o la instalación de la app).\n3. Incluye secciones secundarias como "Entrevistas", "Humor" o "Datos curiosos".\n4. Dibuja o pega una ilustración central que servirá de portada para tu revista.\n5. Sube una foto de la portada y su artículo de frente.' }
        ]
      }]
    },
    {
      id: 'mat_3',
      name: 'Matemáticas',
      icon: 'Calculator',
      topics: [{
        id: 't_mat_3',
        name: 'Geometría y Probabilidad',
        tasks: [
          { id: 'task_mat_3_basic', title: 'Quiz IA: Pitágoras', description: 'Cálculo de hipotenusas.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_mat_3_inter', title: 'Semejanza', description: 'Mide la sombra de un poste.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_mat_3_hard', title: 'Proyecto Estadístico', description: 'Encuesta escolar sobre la app.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Elabora una pregunta sencilla sobre nuestra app de fichas o sobre la escuela (ej. "¿Cuál es tu avatar favorito de la Jacobo?" o "¿Cuántos tokens tienes acumulados?").\n2. Pregunta esto a 10 alumnos en tu hora de recreo o de forma controlada.\n3. En tu cuaderno, haz una tabla con las respuestas de cada encuestado.\n4. Diseña una gráfica de barras o de pastel de manera muy limpia con regla y de colores para resumir tus resultados.\n5. Sube una foto clara de tu tabla y tu bonita gráfica.' }
        ]
      }]
    },
    {
      id: 'his_3',
      name: 'Historia',
      icon: 'Globe',
      topics: [{
        id: 't_his_3',
        name: 'Historia Contemporánea',
        tasks: [
          { id: 'task_his_3_basic', title: 'Quiz IA: Guerra Fría', description: 'Muro de Berlín y Carrera Espacial.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_his_3_inter', title: 'Ensayo Globalización', description: 'Impacto económico en México.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_his_3_hard', title: 'Documental Histórico', description: 'Entrevista a un abuelo o adulto sobre el México del siglo pasado (video/escrito).', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Acércate a tus abuelos, a tus papás, o a un maestro que viviera en las décadas de los 70s, 80s o 90s.\n2. Pregúntales tres cosas básicas sobre esa época:\n   - ¿Cómo era ir a la escuela secundaria en aquel entonces?, ¿se usaban las tecnologías?\n   - ¿Qué jugaban en el recreo o con sus amigos de la colonia?\n   - ¿Cuáles eran las canciones, ropa o modas preferidas de los jóvenes en su juventud?\n3. Escribe en tu libreta el nombre del entrevistado y sus interesantes respuestas en un reporte formal de 1 página entera.\n4. Si te dan permiso, puedes grabar un audio/video corto o subir la foto de tu escrito legible.' }
        ]
      }]
    },
    {
      id: 'qui_3',
      name: 'Química',
      icon: 'Beaker',
      topics: [{
        id: 't_qui_3',
        name: 'Las Propiedades de los Materiales',
        tasks: [
          { id: 'task_qui_3_basic', title: 'Quiz IA: Tabla Periódica', description: 'Elementos y sus símbolos.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_qui_3_inter', title: 'Mezclas y Compuestos', description: 'Experimento de separación de mezclas.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. En un plato de plástico o de vidrio, mezcla una cucharada de arroz crudo con una cucharada de sal fina escolar.\n2. Planea un método para separar totalmente esos dos ingredientes sólidos de nuevo sin destruir sus propiedades.\n3. En tu cuaderno escribe:\n   - ¿Qué método usaste (filtración, imantación, tamizado, decantación)?\n   - ¿Cómo resultó tu procedimiento?\n4. Coloca el arroz ya separado y la sal limpia un lado de tus apuntes y toma una foto de la comprobación.' },
          { id: 'task_qui_3_hard', title: 'Reacciones Químicas', description: 'Explica el proceso de oxidación física cotidiana.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Corta un trozo de manzana, pera o plátano fresco y déjalo expuesto directo al aire libre por 2 horas sin tapar.\n2. Al cabo de ese tiempo, anota en tu cuaderno los cambios físicos que observas (color amarillento/marrón oscuro, textura, olor).\n3. Explica qué causó esta reacción (oxidación enzimática en contacto con el oxígeno ambiental).\n4. ¿Cómo crees que se podría retardar este cambio (bañando la fruta en jugo de limón, envolviéndola en plástico, metiéndola al refrigerador)? Compruébalo y anota tus descubrimientos.\n5. Sube una foto de la manzana oxidada al lado de tus notas.' }
        ]
      }]
    },
    {
      id: 'tec_3',
      name: 'Tecnología',
      icon: 'Cpu',
      topics: [{
        id: 't_tec_3',
        name: 'Innovación y Futuro',
        tasks: [
          { id: 'task_tec_3_basic', title: 'Quiz IA: Robótica', description: 'Componentes de un robot.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_tec_3_inter', title: 'Prototipo de App', description: 'Dibuja 5 pantallas de una app.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_tec_3_hard', title: 'Impresión 3D', description: 'Diseño CAD en papel de una pieza útil.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Piensa en una pieza escolar rota o que haga falta en el plantel (un perchero para las mochilas, una pieza para reparar la persiana, o un estuche organizador de plumones para el pizarrón).\n2. En una página completa de tu libreta, dibuja un "Plano Técnico tridimensional" (isométrico) de este objeto de forma limpia.\n3. Rotula las medidas principales que debería tener (alto, ancho, profundidad, grosor de las paredes) pensadas en centímetros reales.\n4. Señala de qué material sugerirías fabricarlo para que no se rompa (plástico rígido PLA, filamento flexible, etc.).\n5. Sube la foto del plano.' }
        ]
      }]
    },
    {
      id: 'fce_3',
      name: 'Formación Cívica y Ética',
      icon: 'Users',
      topics: [{
        id: 't_fce_3',
        name: 'Ciudadanía Global',
        tasks: [
          { id: 'task_fce_3_basic', title: 'Quiz IA: Derechos Humanos', description: 'Organismos internacionales.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_fce_3_inter', title: 'Campaña Social', description: 'Crea un poster contra el bullying.', difficulty: 'Medium', type: 'Exercise', reward: { tokens: 50 } },
          { id: 'task_fce_3_hard', title: 'Voluntariado', description: 'Realiza 1 hora de servicio social en tu escuela u hogar.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Convierte la empatía en acción real de servicio. Realiza una de estas acciones positivas durante el día escolar o en tu hogar:\n   - Ayuda a recoger y limpiar los pupitres de tu salón al finalizar las clases.\n   - Apoya a tu familia ordenando tu cuarto o barriendo tu casa.\n   - Planta una plantita en tu escuela o en casa y riégala de forma amorosa.\n2. En tu libreta escribe 3 renglones describiendo qué buena acción hiciste y cómo te sentiste al contribuir al bienestar general de los tuyos.\n3. Sube la foto de tu libreta firmada o una foto tuya colaborando.' }
        ]
      }]
    },
    {
      id: 'ing_3',
      name: 'Inglés',
      icon: 'Languages',
      topics: [{
        id: 't_ing_3',
        name: 'Future Plans',
        tasks: [
          { id: 'task_ing_3_basic', title: 'AI Quiz: Future Tenses', description: 'Will vs. Going to.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 }, instructions: 'Demuestra tus conocimientos respondiendo este cuestionario interactivo sobre el uso de los tiempos futuros en inglés utilizando "will" y "going to".' },
          { id: 'task_ing_3_inter', title: 'Job Interview', description: 'Simulate an interview video.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: 'Graba un video simulando una entrevista de trabajo en inglés donde respondas a 3 preguntas básicas (sobre ti, tus fortalezas y por qué quieres el trabajo). Si no puedes grabar video, sube el guion escrito detallado en inglés.' },
          { id: 'task_ing_3_hard', title: 'Ted Talk', description: 'Present a topic in English (3 min).', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: 'Prepara una exposición corta (estilo TED Talk) de 3 minutos en inglés sobre un tema de impacto mundial o escolar (ej. cuidado del agua, tecnología, valores). Sube tu guion escrito en inglés o una foto/video de tu presentación.' }
        ]
      }]
    },
    {
      id: 'art_3',
      name: 'Artes',
      icon: 'Palette',
      topics: [{
        id: 't_art_3',
        name: 'Teatro y Performance',
        tasks: [
          { id: 'task_art_3_basic', title: 'Quiz IA: Dramaturgia', description: 'Autores clásicos universales.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_art_3_inter', title: 'Monólogo', description: 'Interpreta un fragmento teatral o histórico.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Elige una de tus frases favoritas de un personaje teatral célebre (o una frase icónica de un prócer patrio como Don Miguel Hidalgo o Benito Juárez).\n2. Escríbela en tu libreta en letra grande y de manera súper legible.\n3. Ensaya frente al espejo modular tu voz con entonación de oratoria profesional para transmitir pasión e importancia.\n4. Puedes grabar un breve audio recitándolo, o subir la foto de tu libreta con la frase y un dibujo de la máscara del teatro clásico griego.' },
          { id: 'task_art_3_hard', title: 'Producción Audiovisual', description: 'Escribe un guion técnico cinematográfico.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Escribe el guion o "storyboard" técnico para un cortometraje original de 3 minutos de duración.\n2. En tu libreta dibuja una tabla de 3 columnas:\n   - Escena/Toma (ej. Escena 1, Toma abierta)\n   - Imagen (¿Qué se ve en cámara? ej. Un parque vacío)\n   - Audio/Diálogo (¿Qué ruidos se escuchan o qué dicen los personajes?)\n3. Rellena al menos 5 tomas diferentes para contar una historia con principio, nudo y desenlace.\n4. Tómale una foto de frente y con nitidez.' }
        ]
      }]
    },
    {
      id: 'int_cur_3',
      name: 'Integración Curricular',
      icon: 'LayoutGrid',
      topics: [{
        id: 't_int_cur_3',
        name: 'Transversalidad',
        tasks: [
          { id: 'task_int_cur_3_basic', title: 'Reto Integrador', description: 'Propón una solución que use 2 materias.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_int_cur_3_inter', title: 'Proyecto de Vida', description: 'Mapa mental de tus metas escolares.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 }, instructions: '1. Elabora un plan de acción formal de 3 pasos en tu libreta para el paso de secundaria a preparatoria.\n2. Enumera:\n   - Paso 1: ¿Qué preparatorias o bachilleratos te gustaría investigar?\n   - Paso 2: ¿Cuáles temas académicos consideras que debes repasar con mayor dedicación?\n   - Paso 3: ¿Qué hábitos personales (ej. organización, horario de sueño) necesitas afianzar?\n3. Firma tu plan, tómale foto y súbela.' },
          { id: 'task_int_cur_3_hard', title: 'Feria de Ciencias', description: 'Presenta un experimento integral.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true }, instructions: '1. Realiza una investigación aplicada sobre un contaminante cotidiano en tu comunidad (ej. pilas alcalinas gastadas, bolsas plásticas desechadas o el humo de camiones).\n2. En una página de tu cuaderno, plasma un informe estructurado que contenga:\n   - Título formal\n   - Planteamiento: ¿Por qué es dañino para el ecosistema?\n   - Hipótesis: ¿Cuál es la mejor solución ecológica o reciclado alternativo?\n   - Propuesta práctica para concientizar a tus compañeros de la Jacobo.\n3. Sube una foto de tu reporte firmado.' }
        ]
      }]
    }
  ]
};

export const INITIAL_CARDS: Card[] = [
  // THE JACOBO PACK
  {
    id: 'coll_A1_01',
    name: 'Mesabanco de la Jacobo',
    description: 'Igual de nuevos que cuando se compraron en 1996.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: '/cartas/coleccion/A1-01.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_02',
    name: 'La AI se comió mi tarea',
    description: 'Chat, dime cuánto es 2+2.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: '/cartas/coleccion/A1-02.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_03',
    name: 'El fantasma',
    description: 'Dicen que se aparece en la escuela 1 vez por semana.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: '/cartas/coleccion/A1-03.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_04',
    name: 'Mochila de Piedras',
    description: 'Trae de todo menos libros.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: '/cartas/coleccion/A1-04.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_05',
    name: 'Examen en Blanco',
    description: 'Está tan limpio que lo puedes volver a usar el próximo año.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: '/cartas/coleccion/A1-05.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_06',
    name: 'El lápiz invisible',
    description: 'Lo prestaste hace una semana y ahora solo vive en tu memoria.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: '/cartas/coleccion/A1-06.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_07',
    name: 'El Niño Rata',
    description: 'Grita más que de lo que juega. Experto en pedir 1 vs 1 en el recreo.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: '/cartas/coleccion/A1-07.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_08',
    name: 'El Otaku de la Jacobo',
    description: 'Le dijo Sensei al profe. Dice \'Yamete kudasai\' y nadie sabe por qué.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: '/cartas/coleccion/A1-08.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_09',
    name: 'La Niña Fresa',
    description: 'O sea, literal... ¿qué onda con tu outfit? Pide su lateada de fresa los fines.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_10',
    name: 'El que carrea',
    description: 'No usa lentes, usa ChatGPT. Es el que salva el equipo al final.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_11',
    name: 'El alumno extraordinario',
    description: 'Le gusta tanto la escuela que reprueba para seguir en ella.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1491843331263-d71682e2b9bb?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_12',
    name: 'La Guapa del Salón',
    description: 'Tiene 3,000 seguidores en tiktok y 0 tareas entregadas. Icónica.',
    category: 'Collectible',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_13',
    name: 'El director',
    description: 'Controla los balones de voley y tu destino. No lo hagas enojar o te banea de la escuela.',
    category: 'Collectible',
    rarity: 'Legendary',
    imageUrl: '/cartas/coleccion/A1-13.webp',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_14',
    name: 'El profe',
    description: 'Baja puntos por respirar.',
    category: 'Collectible',
    rarity: 'Legendary',
    imageUrl: 'https://images.unsplash.com/photo-1544717297-fa154daaf762?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },

  // CULIACÁN PACK
  {
    id: 'coll_A2_01',
    name: 'Lateada de Nutella',
    description: 'El elixir de los dioses. Te da energía para aguantar hasta el recreo.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1528448835381-e3103b4637f0?w=400&h=600&fit=crop',
    sourcePackId: 'pack_culiacan',
  },
  {
    id: 'coll_A2_02',
    name: 'El sol Culichi',
    description: 'Derrite hasta las ganas de vivir. +50 de daño por deshidratación.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?w=400&h=600&fit=crop',
    sourcePackId: 'pack_culiacan',
  },
  {
    id: 'coll_A2_03',
    name: 'Camión rápido y furioso',
    description: 'El chofer se cree Toretto. Cada tope es un aventura.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=600&fit=crop',
    sourcePackId: 'pack_culiacan',
  },
  {
    id: 'coll_A2_04',
    name: 'El Alucín',
    description: 'Dice que su papá es dueño de Forum. Trae gorra de gallito.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1521112285175-68045952f447?w=400&h=600&fit=crop',
    sourcePackId: 'pack_culiacan',
  },
  {
    id: 'coll_A2_05',
    name: 'Futbolista Frustrado',
    description: 'Se cree el próximo Messi pero se le va el aire a los 5 minutos.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=400&h=600&fit=crop',
    sourcePackId: 'pack_culiacan',
  },
  {
    id: 'coll_A2_06',
    name: 'Perrito Culichi',
    description: 'Mucho calor, muy plebe, wow. El perro más sabio de todo el estado.',
    category: 'Collectible',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=600&fit=crop',
    sourcePackId: 'pack_culiacan',
  },
  {
    id: 'coll_A2_07',
    name: 'La Lomita (Holograma)',
    description: 'El lugar de las citas fallidas. Un monumento a los soldados caídos.',
    category: 'Collectible',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=400&h=600&fit=crop',
    sourcePackId: 'pack_culiacan',
  },
  {
    id: 'coll_A2_08',
    name: 'El Rocha',
    description: 'Felicidades encontrate a Rocha.',
    category: 'Collectible',
    rarity: 'Legendary',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=600&fit=crop',
    sourcePackId: 'pack_culiacan',
  },

  // SIX SEVEN PACK
  {
    id: 'coll_A3_01',
    name: 'El Monte Everest',
    description: 'No tiene nada en contra de mí.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: '/everest.png',
    sourcePackId: 'pack_six_seven',
  },
  {
    id: 'coll_A3_02',
    name: 'Fan de su relación',
    description: 'Le gusta tanto que te la quiere quitar.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=600&fit=crop',
    sourcePackId: 'pack_six_seven',
  },
  {
    id: 'coll_A3_03',
    name: 'Mi Primera Chamba',
    description: 'Intentaste cambiar un foco y se quemó el refri.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5f649e25?w=400&h=600&fit=crop',
    sourcePackId: 'pack_six_seven',
  },
  {
    id: 'coll_A3_04',
    name: 'El gato triste',
    description: 'Tú cuando el profe te cacha copiando.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=600&fit=crop',
    sourcePackId: 'pack_six_seven',
  },
  {
    id: 'coll_A3_05',
    name: 'Detente jochis',
    description: '¡Detente ahí! Sí tú que estás leyendo esto.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=600&fit=crop',
    sourcePackId: 'pack_six_seven',
  },
  {
    id: 'coll_A3_06',
    name: 'Mi momento más humilde',
    description: 'Dolió más que te tumbaran tu coquita que el balonazo.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1617469165786-8007eda3caa7?w=400&h=600&fit=crop',
    sourcePackId: 'pack_six_seven',
  },
  {
    id: 'coll_A3_07',
    name: '6 - 7',
    description: 'No sabes lo que significa.',
    category: 'Collectible',
    rarity: 'Legendary',
    imageUrl: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&h=600&fit=crop',
    sourcePackId: 'pack_six_seven',
  },
  {
    id: 'coll_A3_08',
    name: 'Muy aesthetic',
    description: 'Trae los plumones más caros y el cuaderno impecable, pero no sabe ni cómo prender la computadora.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    sourcePackId: 'pack_six_seven',
  },
  // ACHIEVEMENTS (LOGROS)
  {
    id: 'achiev_1',
    name: 'Primer Paso',
    description: 'Completa tu primer desafío. El viaje de mil millas comienza con un solo paso.',
    category: 'Achievement',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_2',
    name: 'Racha de Bronce',
    description: 'Mantén una racha de 3 días consecutivos.',
    category: 'Achievement',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_3',
    name: 'Racha de Plata',
    description: 'Mantén una racha de 7 días consecutivos.',
    category: 'Achievement',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_4',
    name: 'Racha de Oro',
    description: 'Mantén una racha de 14 días consecutivos.',
    category: 'Achievement',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_5',
    name: 'Mente Inquieta',
    description: 'Completa 5 desafíos en un solo día.',
    category: 'Achievement',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_6',
    name: 'Matemático Aficionado',
    description: 'Supera 5 desafíos de Matemáticas.',
    category: 'Achievement',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1632516440620-833446b5a3eb?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_7',
    name: 'Euler Reencarnado',
    description: 'Supera 20 desafíos de Matemáticas. Un dios de los números.',
    category: 'Achievement',
    rarity: 'Legendary',
    imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_8',
    name: 'Explorador del Pasado',
    description: 'Resuelve 10 desafíos de Historia.',
    category: 'Achievement',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_9',
    name: 'Científico Loco',
    description: 'Supera 10 desafíos de Física o Química.',
    category: 'Achievement',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_10',
    name: 'Políglota',
    description: 'Completa 15 desafíos de Inglés.',
    category: 'Achievement',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_11',
    name: 'Explorador Natural',
    description: 'Registra y aprueba 5 desafíos de Biología o Geografía.',
    category: 'Achievement',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_12',
    name: 'Alma Artística',
    description: 'Completa 10 desafíos de Artes.',
    category: 'Achievement',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_13',
    name: 'Cívico Ejemplar',
    description: 'Completa 10 desafíos de Formación Cívica y Ética.',
    category: 'Achievement',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_14',
    name: 'Erudito Hardcore',
    description: 'Supera 10 desafíos de dificultad Difícil.',
    category: 'Achievement',
    rarity: 'Legendary',
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_15',
    name: 'Amante del Peligro',
    description: 'Falla y vuelve a intentar el mismo desafío 5 veces.',
    category: 'Achievement',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1496264906951-872f232ce5a6?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_16',
    name: 'Capitalista del Saber',
    description: 'Acumula un total de 5,000 medallas en tu cuenta.',
    category: 'Achievement',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_17',
    name: 'Coleccionista Principiante',
    description: 'Obtén tus primeras 10 cartas.',
    category: 'Achievement',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_18',
    name: 'Maestro Coleccionista',
    description: 'Completa un álbum de cartas o consigue 50 diferentes.',
    category: 'Achievement',
    rarity: 'Legendary',
    imageUrl: 'https://images.unsplash.com/photo-1531685250784-afb348722c86?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_19',
    name: 'Aperturista Compulsivo',
    description: 'Abre 20 sobres de cartas en total.',
    category: 'Achievement',
    rarity: 'Epic',
    imageUrl: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=400&h=600&fit=crop',
  },
  {
    id: 'achiev_20',
    name: 'El Perfeccionista',
    description: 'Completa 100% de tus misiones semanales sin fallar.',
    category: 'Achievement',
    rarity: 'Secret',
    imageUrl: 'https://images.unsplash.com/photo-1483366774565-c72664746f36?w=400&h=600&fit=crop',
  },
];

export const SCHOOL_GROUPS: Grade[] = ['1A', '1B', '1C', '1D', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D'];

export const RARITY_CONFIG = {
  Common: { color: 'border-slate-800', lightColor: 'text-slate-400', shadow: 'shadow-slate-900/10' },
  Rare: { color: 'border-blue-500/50', lightColor: 'text-blue-400', shadow: 'shadow-blue-500/20' },
  Epic: { color: 'border-purple-600/50', lightColor: 'text-purple-400', shadow: 'shadow-purple-500/20' },
  Legendary: { color: 'border-amber-500/50', lightColor: 'text-amber-400', shadow: 'shadow-amber-500/30' },
  Secret: { color: 'border-rose-500/50', lightColor: 'text-rose-400', shadow: 'shadow-rose-500/40' },
};

export const INITIAL_CHALLENGE: Challenge = {
  id: 'daily_1',
  subject: 'Cultura General',
  question: '¿Qué elemento de la tabla periódica tiene el símbolo "O"?',
  options: [
    'Oro',
    'Osmio',
    'Oxígeno',
    'Oganesón'
  ],
  correctAnswer: 2,
  difficulty: 'Easy',
  tokenReward: 25
};

export const INITIAL_PACKS: Pack[] = [
  {
    id: 'pack_jacobo',
    name: 'Sobrecitos de la Jacobo',
    price: 150,
    cardsCount: 4,
    active: true,
    rarities: {
      common: 80,
      rare: 15,
      epic: 4,
      legendary: 1,
      secret: 0
    }
  },
  {
    id: 'pack_culiacan',
    name: 'Sobrecitos de Culiacán',
    price: 150,
    cardsCount: 4,
    active: true,
    rarities: {
      common: 60,
      rare: 25,
      epic: 10,
      legendary: 5,
      secret: 0
    }
  },
  {
    id: 'pack_six_seven',
    name: 'Sobrecitos Six Seven',
    price: 150,
    cardsCount: 4,
    active: true,
    rarities: {
      common: 0,
      rare: 50,
      epic: 35,
      legendary: 15,
      secret: 0
    }
  }
];

export const RARITY_COLORS = {
  Common: 'from-gray-400 to-gray-600',
  Rare: 'from-blue-400 to-blue-600',
  Epic: 'from-purple-400 to-purple-600 border-purple-300',
  Legendary: 'from-amber-300 to-yellow-600 border-yellow-200 shadow-yellow-500/50',
  Secret: 'from-rose-500 to-pink-700 border-rose-300 shadow-rose-500/60',
};
