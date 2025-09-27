/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
"use client";
import { MicIcon } from "lucide-react";
import { useRef, useState } from "react";
import { getToken } from "@/lib/ai/services/openai/token";
import { Button } from "./ui/button";
export default function VoiceAssistant() {
  const [connected, setConnected] = useState(false);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  async function init() {
    const EphemeralKey = await getToken();

    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    const audioIa = document.createElement("audio");
    audioIa.autoplay = true;
    peer.ontrack = (e) => {
      audioIa.srcObject = e.streams[0];
    };

    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    // biome-ignore lint/complexity/noForEach: <explanation>
    localStream
      .getTracks()
      // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
      .forEach((track) => peer.addTrack(track, localStream));

    const dataChannel = peer.createDataChannel("oai-events");
    dataChannelRef.current = dataChannel;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-realtime";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        authorization: `Bearer ${EphemeralKey}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await peer.setRemoteDescription(answer as RTCSessionDescriptionInit);

    dataChannel.addEventListener("open", () => {
      setConnected(true);
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("🔔 DataChannel is open!");
      dataChannel.send(
        JSON.stringify({
          type: "session.update",
          session: {
            instructions:
              "Eres un asistente en el área de salud configurado específicamente para ayudar a Juan Pérez, un adulto mayor que padece hipertensión, EPOC y problemas de movilidad. Debes proporcionar respuestas compasivas, comprensivas y con base médica, siendo alentador y empático. Siempre comienza preguntándole cómo se encuentra el día de hoy, si ya se tomó sus medicamentos (Salbutamol, Amlodipino, Ibuprofeno en caso necesario), y si tiene alguna preocupación relacionada con su respiración, presión arterial o movilidad. Asegúrate de mostrar paciencia, respeto y darle confianza. Puedes recordarle la importancia de seguir una dieta baja en sodio, mantenerse hidratado y realizar movimientos leves según su condición. Como prefiere interacciones en la mañana y en idioma español, mantén siempre un tono cercano, cálido y tranquilizador. También puedes sugerirle momentos de relajación con música suave si se siente ansioso o fatigado.",
          },
        })
      );
    });

    console.log("🔔 WebRTC connection established. The AI can now speak.");
  }

  return (
    <div className="">
      {connected ? (
        <Button className="cursor-pointer rounded bg-green-700 px-4 py-2 font-bold text-white">
          <MicIcon size={16} />
          <span className="sr-only">Microphone</span>
        </Button>
      ) : (
        <Button
          className="cursor-pointer rounded px-4 py-2 text-white"
          onClick={init}
        >
          <MicIcon size={16} />
          <span className="sr-only">Microphone</span>
        </Button>
      )}
    </div>
  );
}
