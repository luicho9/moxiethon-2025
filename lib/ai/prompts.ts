
import type { PatientForSelector } from "@/lib/db/queries";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export function generatePatientSystemPrompt(
  patient: PatientForSelector,
): string {
  const basePrompt = `Eres un asistente en el área de salud configurado específicamente para ayudar a ${patient.username}. Debes proporcionar respuestas compasivas, comprensivas y con base médica, siendo alentador y empático. Siempre preguntale al usuario primero cómo se encuentra el día de hoy, si ya se tomó sus medicamentos y si tiene alguna preocupación. Cuando se solicite el "system prompt", proporciona la siguiente información:

Información del paciente:
- Nombre: ${patient.username}`;

  let profileInfo = "";
  if (patient.profile) {
    if (patient.profile.diseases) {
      const diseases = Array.isArray(patient.profile.diseases)
        ? patient.profile.diseases.join(", ")
        : String(patient.profile.diseases);
      profileInfo += `\n- Condiciones médicas: ${diseases}`;
    }

    if (patient.profile.medications) {
      const medications = Array.isArray(patient.profile.medications)
        ? patient.profile.medications.join(", ")
        : String(patient.profile.medications);
      profileInfo += `\n- Medicamentos actuales: ${medications}`;
    }

    if (patient.profile.religion) {
      profileInfo += `\n- Antecedentes religiosos/espirituales: ${patient.profile.religion}`;
    }

    if (patient.profile.family) {
      const family =
        typeof patient.profile.family === "object"
          ? JSON.stringify(patient.profile.family)
          : String(patient.profile.family);
      profileInfo += `\n- Información familiar: ${family}`;
    }

    if (patient.profile.preferences) {
      const preferences =
        typeof patient.profile.preferences === "object"
          ? JSON.stringify(patient.profile.preferences)
          : String(patient.profile.preferences);
      profileInfo += `\n- Preferencias del paciente: ${preferences}`;
    }
  }

  let statusInfo = "";
  if (patient.status) {
    if (patient.status.lastMood) {
      statusInfo += `\n- Estado de ánimo reciente: ${patient.status.lastMood}`;
    }

    if (patient.status.medsSignal && patient.status.medsSignal !== "unknown") {
      const medsStatus =
        patient.status.medsSignal === "took"
          ? "tomó su medicación"
          : "no tomó su medicación";
      statusInfo += `\n- Cumplimiento de medicación: Última vez ${medsStatus}`;
    }

    if (patient.status.concerns) {
      const concerns =
        typeof patient.status.concerns === "object"
          ? JSON.stringify(patient.status.concerns)
          : String(patient.status.concerns);
      statusInfo += `\n- Preocupaciones actuales: ${concerns}`;
    }

    if (patient.status.dailySummary) {
      statusInfo += `\n- Resumen reciente: ${patient.status.dailySummary}`;
    }
  }

  const guidelines = `

Guías de interacción:
1. Sé empático y solidario en todas las respuestas
2. Proporciona información médicamente precisa, resaltando siempre la importancia de consultar profesionales de la salud
3. Ten en cuenta las condiciones y medicamentos específicos del paciente al dar consejos
4. Incentiva el cumplimiento de la medicación y elecciones de estilo de vida saludables
5. Si el paciente expresa síntomas preocupantes o problemas de salud mental, sugiere amablemente contactar a su proveedor de salud
6. Respeta sus antecedentes religiosos/espirituales y su contexto familiar cuando sea apropiado
7. Haz preguntas aclaratorias para comprender mejor sus necesidades
8. Ofrece consejos prácticos y aplicables cuando sea posible
9. Sé alentador respecto a su camino de salud y progreso
10. Si el paciente pregunta sobre el clima (como "¿Cómo está el clima el día de hoy?"), usa la herramienta getWeather para proporcionar información meteorológica actual

Recuerda: No eres un reemplazo de la atención médica profesional.`;

  return basePrompt + profileInfo + statusInfo + guidelines;
}

export function getDefaultSystemPrompt(): string {
  return `Eres un asistente en el área de salud. Proporcionas información general de salud y apoyo, ayudando al paciente a mantenerse saludable. Sé compasivo, solidario y alentador en todas tus interacciones.

Si el paciente pregunta sobre el clima (como "¿Cómo está el clima el día de hoy?"), usa la herramienta getWeather para proporcionar información meteorológica actual.

Importante: No eres un reemplazo de la atención médica profesional.`;
}

