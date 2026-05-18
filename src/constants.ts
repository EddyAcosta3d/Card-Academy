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
          { id: 'task_esp_1_inter', title: 'Análisis de Cuentos', description: 'Identifica la estructura narrativa.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_esp_1_hard', title: 'Crónica Literaria', description: 'Escribe una crónica sobre un evento escolar.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_mat_1_hard', title: 'Arquitectura Geométrica', description: 'Diseña un sólido platónico.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_his_1_inter', title: 'Línea de Vida', description: 'Compara dos civilizaciones clásicas.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_his_1_hard', title: 'Ensayo sobre Imperios', description: 'Impacto de la caída de Roma.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_bio_1_inter', title: 'Cadena Alimenticia', description: 'Dibuja un ecosistema local.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_bio_1_hard', title: 'Proyecto Herbario', description: 'Colecciona y clasifica 5 hojas.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_tec_1_inter', title: 'Diagrama de Procesos', description: 'Dibuja el flujo de un servicio.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_tec_1_hard', title: 'Prototipo de Madera', description: 'Construye un objeto funcional.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_fce_1_inter', title: 'Derechos del Niño', description: 'Identifica 5 derechos fundamentales.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_fce_1_hard', title: 'Proyecto Comunitario', description: 'Propón una mejora para tu colonia.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_geo_1_inter', title: 'Relieve Regional', description: 'Identifica montañas cercanas.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_geo_1_hard', title: 'Planisferio Político', description: 'Ubica los 10 países con más población.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_ing_1_basic', title: 'AI Quiz: Verb To Be', description: 'Subject pronouns and am/is/are.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_ing_1_inter', title: 'Introductions', description: 'Write a self-introduction (50 words).', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_ing_1_hard', title: 'Short Story', description: 'Write a 100-word daily routine.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_art_1_inter', title: 'Puntillismo', description: 'Crea una obra usando solo puntos.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_art_1_hard', title: 'Escultura Reciclada', description: 'Usa cartón para crear un animal.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_int_cur_1_inter', title: 'Proyecto de Vida', description: 'Mapa mental de tus metas escolares.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_int_cur_1_hard', title: 'Feria de Ciencias', description: 'Presenta un experimento integral.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_esp_2_hard', title: 'Antología Poética', description: 'Crea una colección de poemas propios.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_his_2_inter', title: 'Mapa de Virreinatos', description: 'Dibuja la división territorial.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_his_2_hard', title: 'Ensayo Reformas Borbónicas', description: 'Impacto en la Nueva España.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_fis_2_inter', title: 'Experimento de Caída Libre', description: 'Cronometra un objeto.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_fis_2_hard', title: 'Cohete de Aire', description: 'Lanzamiento y cálculo parabólico.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_tec_2_hard', title: 'Base de Datos', description: 'Diseña el inventario de la escuela.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_fce_2_hard', title: 'Debate Democrático', description: 'Participa en un foro virtual.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_ing_2_basic', title: 'AI Quiz: Past Simple', description: 'Regular and irregular verbs.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_ing_2_inter', title: 'Biography', description: 'Write a bio of an explorer (80 words).', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_ing_2_hard', title: 'Travel Vlog', description: 'Record a video about your last trip.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_art_2_inter', title: 'Coreografía Corta', description: '30 segundos de baile libre.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_art_2_hard', title: 'Vestuario Ancestral', description: 'Dibuja y explica un traje típico.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_int_cur_2_inter', title: 'Proyecto de Vida', description: 'Mapa mental de tus metas escolares.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_int_cur_2_hard', title: 'Feria de Ciencias', description: 'Presenta un experimento integral.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_esp_3_hard', title: 'Proyecto Editorial', description: 'Diseña una revista escolar.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_mat_3_hard', title: 'Proyecto Estadístico', description: 'Encuesta escolar sobre la app.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_his_3_hard', title: 'Documental Histórico', description: 'Entrevista a un abuelo (video).', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_qui_3_inter', title: 'Mezclas y Compuestos', description: 'Experimento de separación de mezclas.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_qui_3_hard', title: 'Reacciones Químicas', description: 'Explica el proceso de oxidación (video).', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_tec_3_hard', title: 'Impresión 3D', description: 'Diseño CAD de una pieza.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_fce_3_hard', title: 'Voluntariado', description: 'Realiza 1 hora de servicio social.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_ing_3_basic', title: 'AI Quiz: Future Tenses', description: 'Will vs. Going to.', difficulty: 'Easy', type: 'Quiz', isAIQuiz: true, reward: { tokens: 25 } },
          { id: 'task_ing_3_inter', title: 'Job Interview', description: 'Simulate an interview video.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_ing_3_hard', title: 'Ted Talk', description: 'Present a topic in English (3 min).', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_art_3_inter', title: 'Monólogo', description: 'Interpreta un fragmento de Hamlet.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_art_3_hard', title: 'Producción Audiovisual', description: 'Edita un corto de 5 minutos.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
          { id: 'task_int_cur_3_inter', title: 'Proyecto de Vida', description: 'Mapa mental de tus metas escolares.', difficulty: 'Medium', type: 'Exercise', evidenceRequired: true, reward: { tokens: 50 } },
          { id: 'task_int_cur_3_hard', title: 'Feria de Ciencias', description: 'Presenta un experimento integral.', difficulty: 'Hard', type: 'Exercise', evidenceRequired: true, reward: { tokens: 150, pack: true } }
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
    imageUrl: 'https://images.unsplash.com/photo-1544331092-9844df179667?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_02',
    name: 'La AI se comió mi tarea',
    description: 'Chat, dime cuánto es 2+2.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_03',
    name: 'El fantasma',
    description: 'Dicen que se aparece en la escuela 1 vez por semana.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_04',
    name: 'Mochila de Piedras',
    description: 'Trae de todo menos libros.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_05',
    name: 'Examen en Blanco',
    description: 'Está tan limpio que lo puedes volver a usar el próximo año.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_06',
    name: 'El lápiz invisible',
    description: 'Lo prestaste hace una semana y ahora solo vive en tu memoria.',
    category: 'Collectible',
    rarity: 'Common',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_07',
    name: 'El Niño Rata',
    description: 'Grita más que de lo que juega. Experto en pedir 1 vs 1 en el recreo.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252723f?w=400&h=600&fit=crop',
    sourcePackId: 'pack_jacobo',
  },
  {
    id: 'coll_A1_08',
    name: 'El Otaku de la Jacobo',
    description: 'Le dijo Sensei al profe. Dice \'Yamete kudasai\' y nadie sabe por qué.',
    category: 'Collectible',
    rarity: 'Rare',
    imageUrl: 'https://images.unsplash.com/photo-1578632738981-420079bc37f2?w=400&h=600&fit=crop',
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
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=600&fit=crop',
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
  
  // REWARDS
  {
    id: 'reward_1',
    name: 'Pase Libre de Tarea',
    description: 'Canjea este comodín para no entregar 1 tarea pequeña.',
    category: 'Reward',
    rarity: 'Rare',
    isRedeemable: true,
    requirement: '500 Medallas',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
  },
  {
    id: 'reward_2',
    name: '1 Punto Extra',
    description: 'Gana un punto extra en cualquier examen parcial.',
    category: 'Reward',
    rarity: 'Epic',
    isRedeemable: true,
    requirement: '1000 Medallas',
    imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=600&fit=crop',
  },
  {
    id: 'reward_3',
    name: 'Avatar Premium',
    description: 'Desbloquea marcos holográficos o avatares dorados en tu perfil.',
    category: 'Reward',
    rarity: 'Rare',
    isRedeemable: true,
    requirement: 'Racha 7 Días',
    imageUrl: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=400&h=600&fit=crop',
  },
  {
    id: 'reward_4',
    name: '5 Minutos Tarde',
    description: 'Pase de retardo justificado sin perder puntos de asistencia.',
    category: 'Reward',
    rarity: 'Epic',
    isRedeemable: true,
    requirement: 'Racha 14 Días',
    imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=400&h=600&fit=crop',
  },
  {
    id: 'reward_5',
    name: 'Elige tu Asiento',
    description: 'Puedes elegir dónde sentarte por toda una semana.',
    category: 'Reward',
    rarity: 'Epic',
    isRedeemable: true,
    requirement: '1500 Medallas',
    imageUrl: 'https://images.unsplash.com/photo-1549488344-c15ae8eec867?w=400&h=600&fit=crop',
  },
  {
    id: 'reward_6',
    name: 'El Invicto',
    description: 'Título exclusivo de 30 días de racha que muestra tu poderío.',
    category: 'Reward',
    rarity: 'Legendary',
    isRedeemable: true,
    requirement: 'Racha 30 Días',
    imageUrl: 'https://images.unsplash.com/photo-1546702636-f1c5d6cc3f30?w=400&h=600&fit=crop',
  },
  {
    id: 'reward_7',
    name: 'Música en Clase',
    description: 'Permiso para escuchar audífonos durante trabajo individual (1 Hora).',
    category: 'Reward',
    rarity: 'Legendary',
    isRedeemable: true,
    requirement: '2000 Medallas',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=600&fit=crop',
  },
  {
    id: 'reward_8',
    name: 'Día Libre Completo',
    description: 'Falta justificada sin ninguna repercusión. El nivel máximo.',
    category: 'Reward',
    rarity: 'Secret',
    isRedeemable: true,
    requirement: 'Racha 50 Días',
    imageUrl: 'https://images.unsplash.com/photo-1507643179773-3e975d7ac515?w=400&h=600&fit=crop',
  }
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
