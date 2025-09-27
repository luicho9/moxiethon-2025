import VoiceAssistant from "@/components/voice-assistant";

export default function RealtimePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="font-bold text-2xl">Realtime AI Voice Assistant</h1>
      <p>
        This page connects to OpenAI's realtime API to power your AI assistant.
      </p>
      <VoiceAssistant />
    </div>
  );
}
