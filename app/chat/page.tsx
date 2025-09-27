"use client";

import { useChat } from "@ai-sdk/react";
import { CopyIcon, RefreshCcwIcon, UserIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Action, Actions } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import VoiceAssistant from "@/components/voice-assistant";

const models = [
  // {
  //   name: "GPT 5",
  //   value: "openai/gpt-5-chat-latest",
  // },
  {
    name: "GPT 4o",
    value: "openai/gpt-4o",
  },
];

type Patient = {
  userId: string;
  username: string;
  profile: {
    diseases: unknown;
    medications: unknown;
    religion: string | null;
    family: unknown;
    preferences: unknown;
  } | null;
  status: {
    lastMood: string | null;
    medsSignal: "took" | "skipped" | "unknown";
    concerns: unknown;
    dailySummary: string | null;
  } | null;
};

export default function Page() {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(models[0].value);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  const { messages, sendMessage, status, regenerate } = useChat();

  const defaultSuggestions = [
    "Recordemos una de mis memorias",
    "Juguemos un juego mental",
    "¿Qué medicamentos debo tomar?",
  ];

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/patients");
        const data = await response.json();
        if (data.patients) {
          setPatients(data.patients);
        }
      } catch {
        // Silently handle error for demo purposes
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model,
          patientId: selectedPatient,
        },
      }
    );
    setInput("");
  };

  const selectedPatientData = patients.find(
    (p) => p.userId === selectedPatient
  );

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(
      {
        text: suggestion,
      },
      {
        body: {
          model,
          patientId: selectedPatient,
        },
      }
    );
  };

  return (
    <div className="relative mx-auto size-full h-screen max-w-4xl p-3 sm:p-6">
      <div className="flex h-full flex-col">
        {selectedPatientData && (
          <div className="mb-4 rounded-lg border bg-blue-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm sm:text-base">
                  Paciente actual: {selectedPatientData.username}
                </span>
              </div>
              {selectedPatientData.status?.lastMood && (
                <span className="text-blue-700 text-xs sm:text-sm">
                  (Mood reciente: {selectedPatientData.status.lastMood})
                </span>
              )}
            </div>
          </div>
        )}

        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === "assistant" &&
                  message.parts.filter((part) => part.type === "source-url")
                    .length > 0 && (
                    <Sources>
                      <SourcesTrigger
                        count={
                          message.parts.filter(
                            (part) => part.type === "source-url"
                          ).length
                        }
                      />
                      {message.parts
                        .filter((part) => part.type === "source-url")
                        .map((part, i) => (
                          <SourcesContent key={`${message.id}-${i}`}>
                            <Source
                              href={part.url}
                              key={`${message.id}-${i}`}
                              title={part.url}
                            />
                          </SourcesContent>
                        ))}
                    </Sources>
                  )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{part.text}</Response>
                            </MessageContent>
                          </Message>
                          {message.role === "assistant" &&
                            i === messages.length - 1 && (
                              <Actions className="mt-2">
                                <Action
                                  label="Retry"
                                  onClick={() => regenerate()}
                                >
                                  <RefreshCcwIcon size={16} />
                                </Action>
                                <Action
                                  label="Copy"
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                >
                                  <CopyIcon size={16} />
                                </Action>
                              </Actions>
                            )}
                        </Fragment>
                      );
                    case "reasoning":
                      return (
                        <Reasoning
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            i === message.parts.length - 1 &&
                            message.id === messages.at(-1)?.id
                          }
                          key={`${message.id}-${i}`}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === "submitted" && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {messages.length === 0 && (
          <div className="mb-4 px-2">
            <Suggestions>
              {defaultSuggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  onClick={handleSuggestionClick}
                  suggestion={suggestion}
                />
              ))}
            </Suggestions>
          </div>
        )}

        <PromptInput
          className="mt-4"
          globalDrop
          multiple
          onSubmit={handleSubmit}
        >
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <div className="flex w-full flex-wrap items-center gap-2">
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <VoiceAssistant />
              </PromptInputTools>

              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                <PromptInputModelSelect
                  onValueChange={(value) => {
                    setSelectedPatient(value === "none" ? null : value);
                  }}
                  value={selectedPatient || "none"}
                >
                  <PromptInputModelSelectTrigger>
                    <UserIcon size={16} />
                    <PromptInputModelSelectValue
                      placeholder={
                        isLoadingPatients
                          ? "Cargando..."
                          : "Seleccionar paciente"
                      }
                    />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    <PromptInputModelSelectItem value="none">
                      No hay paciente seleccionado
                    </PromptInputModelSelectItem>
                    {patients.map((patient) => (
                      <PromptInputModelSelectItem
                        key={patient.userId}
                        value={patient.userId}
                      >
                        {patient.username}
                        {patient.status?.medsSignal &&
                          patient.status.medsSignal !== "unknown" && (
                            <span
                              className={`ml-2 text-xs ${
                                patient.status.medsSignal === "took"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              (
                              {patient.status.medsSignal === "took" ? "✓" : "⚠"}
                              )
                            </span>
                          )}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>

                <PromptInputModelSelect
                  onValueChange={(value) => {
                    setModel(value);
                  }}
                  value={model}
                >
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((m) => (
                      <PromptInputModelSelectItem key={m.value} value={m.value}>
                        {m.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </div>

              <PromptInputSubmit
                disabled={!(input || status)}
                status={status}
              />
            </div>
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
