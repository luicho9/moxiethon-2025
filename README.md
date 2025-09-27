# Demo Hackathon: Apoyo Integral para Adultos Mayores

**Equipo:** Los Primos

---

## 1. El Problema

En instituciones de cuidado y también en casa, los adultos mayores (especialmente mayores de 75 años) enfrentan tres desafíos principales:

- **Soledad e aislamiento social**, que incrementan depresión y deterioro cognitivo.
- **Dificultad para mantener rutinas**, como recordar medicación, ejercitar la memoria o mantenerse orientados en el presente.
- **Fragilidad y riesgo clínico elevado**, lo que aumenta hospitalizaciones, caídas y deterioro rápido.

Para las enfermeras y familiares, esto significa:

- Falta de información en tiempo real.
- Dificultad para priorizar a quién atender primero.
- Poca capacidad de anticiparse a complicaciones.

---

## 2. Nuestra Solución Demo

Presentamos una solución integral y conectada en dos módulos:

### Módulo 1: Compañero de IA con voz

- **Audio en lugar de texto**: las personas mayores encuentran más natural hablar que escribir.
- **Conversación personalizadas**: el sistema conoce recuerdos, gustos, familia y rutinas del paciente (cargados por enfermeras o familiares).
- **Terapias digitales integradas**:
  - Orientación a la realidad: habla sobre el clima de hoy, la hora, noticias sencillas.
  - Terapia de reminiscencia: recuerda momentos familiares o fotos pasadas cargadas en el sistema.
  - Juegos mentales: _puzzles_ simples, preguntas de memoria, pequeños cálculos.

**Beneficio:** mayor conexión emocional, estimulación cognitiva, reducción de la soledad y mejor adherencia a rutinas.

### Módulo 2: Dashboard de Análisis (Streamlit)

- **Datos en tiempo real**: las interacciones diarias con el compañero de IA generan métricas (sueño reportado, estado de ánimo, adherencia, orientación).
- **Modelos de Machine Learning** analizan esos datos para predecir:
  - Riesgo de hospitalización en 30 días.
  - Fragilidad / riesgo de supervivencia a 6 meses.
  - Riesgo de progresión de la demencia en 6 meses.
- **Visualización clara**:
  - Semáforo de riesgo (alto, medio, bajo).
  - Gráficas de sueño, pasos, oxígeno, estado de ánimo.
  - PDF de _handoff_ para turnos de enfermería.

**Beneficio:** permite priorizar a pacientes de alto riesgo y enfocar recursos donde más impacto se logra.

---

## 3. Respaldo Médico y Científico

- **Orientación a la realidad**: recomendada para adultos con demencia, ayuda a reducir confusión y ansiedad.
- **Terapia de reminiscencia**: basada en estudios que muestran mejoras en ánimo, autoestima y memoria episódica.
- **Juegos mentales y estimulación cognitiva**: ejercitan memoria, atención y funciones ejecutivas, ralentizando el deterioro.
- **Soporte social**: hablar con un acompañante (aunque sea digital) disminuye sensación de soledad, un factor de riesgo para depresión y deterioro cognitivo.

Estas prácticas están documentadas en literatura clínica como efectivas en mejorar bienestar general y función cognitiva.

---

## 4. Ciencia detrás de los Modelos de ML

Los tres modelos usados son reales, aunque entrenados en datos sintéticos para el demo:

- **Regresión logística**: aprende qué factores (oxígeno bajo, sueño pobre, poca adherencia) suelen anticipar hospitalizaciones.
- **Modelo de Cox**: analiza cuánto tiempo pasa hasta que un paciente empeora, comparando fragilidad entre ellos.
- **Gradient Boosting**: detecta combinaciones de factores que aceleran el deterioro cognitivo.

**El valor** no está en acertar con exactitud, sino en dar a las enfermeras una **alerta temprana y priorización objetiva**, complementando su juicio clínico.

---

## 5. ¿Por qué nuestra solución es más beneficiosa?

- **Accesibilidad**: voz en vez de texto, mucho más natural para adultos mayores.
- **Personalización**: cada conversación está basada en recuerdos y datos reales del paciente.
- **Conexión de módulos**: lo que el paciente habla y hace con la IA se transforma en datos útiles para el personal de salud.
- **Prevención**: el dashboard alerta riesgos antes de que se conviertan en crisis.
- **Apoyo al personal**: informes claros, PDF para turnos, exportables para decisiones clínicas.

---

## 6. Conclusión

Nuestra demo muestra cómo la tecnología puede unir **compañía emocional**, **terapias validadas médicamente** y **análisis predictivo**.

Esto significa:

- Pacientes más conectados y activos.
- Familiares más tranquilos.
- Enfermeras con herramientas objetivas para anticiparse a los riesgos.
