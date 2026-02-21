"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, GraduationCap } from "lucide-react";
import { AiEnergyModal } from "@/components/dashboard/ai-energy-modal";
import { NoEnergyModal } from "@/components/no-energy-modal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Write a SIWES introduction for an IT intern at a software company",
  "Generate Chapter 1 outline for a project on e-voting systems",
  "Write an assignment on the advantages of cloud computing",
  "Help me write acknowledgements for my final year project",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noEnergy, setNoEnergy] = useState(false);
  const [pendingInput, setPendingInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  function handleSubmit() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");

    // First message costs 3 energy
    if (messages.length === 0) {
      setPendingInput(text);
      setConfirmOpen(true);
    } else {
      sendMessage(text);
    }
  }

  function handleConfirm() {
    setConfirmOpen(false);
    sendMessage(pendingInput);
    setPendingInput("");
  }

  async function sendMessage(text: string) {
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setStreaming(true);

    // Placeholder assistant message
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.status === 402) {
        setMessages(newMessages); // remove placeholder
        setNoEnergy(true);
        return;
      }
      if (!res.ok) {
        setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value);
        setMessages([...newMessages, { role: "assistant", content: assistantText }]);
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-2xl flex-col">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10">
            <GraduationCap className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Academic Chatbot</h2>
            <p className="text-xs text-text-secondary">
              Specialist in SIWES reports, project intros &amp; Nigerian academic writing ·{" "}
              <span className="text-brand-primary">3 Energy per session</span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-bg-main p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <GraduationCap className="h-10 w-10 text-text-secondary/40" />
            <div>
              <p className="text-sm font-medium text-text-primary">Your academic assistant is ready</p>
              <p className="mt-1 text-xs text-text-secondary">Ask anything about SIWES, projects, or assignments</p>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-lg border border-border bg-bg-section px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:border-brand-primary/30 hover:text-text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-primary text-white"
                    : "bg-bg-section text-text-primary"
                }`}>
                  {msg.content || (
                    streaming && i === messages.length - 1 ? (
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                      </span>
                    ) : null
                  )}
                  {msg.content && streaming && i === messages.length - 1 && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current opacity-70" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-3 shrink-0">
        <div className="flex gap-2 rounded-xl border border-border bg-bg-main p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={2}
            placeholder="Ask about SIWES, projects, assignments… (Enter to send)"
            disabled={streaming}
            className="flex-1 resize-none bg-transparent px-2 py-1 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || streaming}
            className="self-end rounded-lg bg-brand-primary p-2 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-text-secondary/60">
          First message costs 3 energy · Subsequent messages in the session are free
        </p>
      </div>

      <AiEnergyModal open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={handleConfirm} loading={false} />
      <NoEnergyModal open={noEnergy} onClose={() => setNoEnergy(false)} />
    </div>
  );
}
