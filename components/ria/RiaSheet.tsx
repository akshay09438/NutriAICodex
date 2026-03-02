"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Avatar, Button, Input, Modal, ModalBody, ModalContent } from "@heroui/react";
import {
  detectFoodLog,
  getPostAddFollowup,
} from "@/components/ria/riaResponses";
import { addMealToLog, getProfile, getRemainingToday, type MealLog } from "@/lib/storage";
import { formatInt } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "ria";
  text: string;
  isConfirmCard?: boolean;
  payload?: ReturnType<typeof detectFoodLog>;
};

type ParsedRiaMessage = {
  markdown: string;
  ctas: string[];
};

const starter =
  "hey! i'm ria. text me naturally: 'i had dal rice and 2 rotis' or ask me what to eat next.";
const suggestions = [
  "i just had dal rice",
  "what should i eat now?",
  "how am i doing today?",
  "best protein under rs50",
];

export default function RiaSheet({
  isOpen,
  onOpenChange,
  onMealAdded,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdded?: () => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: "m0", role: "ria", text: starter }]);
  const [isSending, setIsSending] = useState(false);

  const showSuggestions = useMemo(
    () => messages.length === 1 && messages[0]?.id === "m0",
    [messages],
  );

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    const foodDetected = detectFoodLog(text);
    if (foodDetected.isFoodLog) {
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: crypto.randomUUID(),
          role: "ria",
          text: "confirm_meal",
          isConfirmCard: true,
          payload: foodDetected,
        },
      ]);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);
    try {
      const response = await fetch("/api/ria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages
            .filter((m) => !m.isConfirmCard)
            .map((m) => ({
              role: m.role === "ria" ? "assistant" : "user",
              content: m.text,
            })),
          profile: getProfile(),
          progress: getRemainingToday(),
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ria",
          text: data.reply || "i had a blank moment there. ask me again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ria",
          text: "i hit a connection issue. try again in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const confirmMeal = (payload: ReturnType<typeof detectFoodLog>) => {
    if (!payload.isFoodLog) return;
    let totalCal = 0;
    let totalProtein = 0;
    payload.detectedFoods.forEach((food) => {
      totalCal += food.calories;
      totalProtein += food.protein_g;
      const meal: MealLog = {
        id: crypto.randomUUID(),
        name: food.name,
        calories: food.calories,
        protein_g: food.protein_g,
        carbs_g: food.carbs_g,
        fat_g: food.fat_g,
        cost: payload.mentionedCost || 0,
        size: food.size,
        logged_at: new Date().toISOString(),
        source: "ria",
      };
      addMealToLog(meal);
    });
    onMealAdded?.();
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ria",
        text: `logged ${formatInt(totalProtein)}g protein\n${getPostAddFollowup()}`,
      },
    ]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom"
      classNames={{
        base: "m-0 rounded-t-3xl border border-[#1A1A1A] bg-white text-black max-w-[420px] mx-auto",
        body: "p-0",
      }}
      size="full"
      hideCloseButton
    >
      <ModalContent>
        <ModalBody>
          <div className="mx-auto h-[90vh] w-full max-w-[420px] px-4 pb-4 pt-3">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#333333]" />
            <div className="mb-3 flex items-center justify-between border-b border-[#1A1A1A] pb-3">
              <div className="flex items-center gap-3">
                <Avatar name="R" className="h-9 w-9 bg-white text-black" />
                <div>
                  <p className="text-sm font-semibold">Ria</p>
                  <p className="text-xs text-[#44FF88]">nutrition guide online</p>
                </div>
              </div>
              <Button isIconOnly className="h-8 w-8 min-w-8 bg-[#F3F4F6] text-black" onPress={() => onOpenChange(false)}>
                x
              </Button>
            </div>

            <div className="mb-3 h-[62vh] space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[88%]"}>
                  {!message.isConfirmCard ? (
                    message.role === "user" ? (
                      <div className="rounded-[16px_16px_4px_16px] bg-white px-4 py-3 text-sm leading-relaxed text-black">
                        {message.text}
                      </div>
                    ) : (
                      <RiaBubble text={message.text} onCtaPress={(cta) => void handleCtaPress(cta, send, onOpenChange)} />
                    )
                  ) : (
                    <MealConfirmCard
                      payload={message.payload!}
                      onConfirm={() => confirmMeal(message.payload!)}
                      onEdit={() => onOpenChange(false)}
                    />
                  )}
                </div>
              ))}
              {isSending ? (
                <div className="mr-auto max-w-[88%] rounded-[16px_16px_16px_4px] border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-white">
                  ria is thinking...
                </div>
              ) : null}
            </div>

            {showSuggestions && (
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((prompt) => (
                  <Button key={prompt} className="h-8 rounded-full border border-[#D4D4D8] bg-transparent px-3 text-xs text-black" onPress={() => send(prompt)}>
                    {prompt}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-[#1A1A1A] pt-3">
              <Input
                value={input}
                onValueChange={setInput}
                placeholder="ask ria anything..."
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isSending) {
                    event.preventDefault();
                    void send(input);
                  }
                }}
                classNames={{
                  inputWrapper:
                    "h-[44px] rounded-full border border-[#D4D4D8] bg-white shadow-none data-[hover=true]:bg-white",
                  input: "text-black",
                }}
              />
              <Button
                className="h-10 min-w-16 rounded-full border border-black bg-white px-3 text-sm font-semibold text-black"
                onPress={() => void send(input)}
                isDisabled={isSending}
              >
                send
              </Button>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function RiaBubble({
  text,
  onCtaPress,
}: {
  text: string;
  onCtaPress: (cta: string) => void;
}) {
  const parsed = parseRiaMessage(text);

  return (
    <div
      className="rounded-[16px_16px_16px_4px]"
      style={{
        background: "#1A1A1A",
        border: "1px solid #2A2A2A",
        padding: "14px 16px",
        maxWidth: "88%",
      }}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p style={{ margin: "0 0 8px 0", lineHeight: "1.6", fontSize: "14px", color: "#FFFFFF" }}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong style={{ color: "#FFFFFF", fontWeight: "700" }}>
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: "4px 0", paddingLeft: "16px", listStyle: "none" }}>
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li
              style={{
                margin: "6px 0",
                fontSize: "14px",
                color: "#FFFFFF",
                lineHeight: "1.5",
                borderLeft: "2px solid #333",
                paddingLeft: "10px",
              }}
            >
              {children}
            </li>
          ),
          h3: ({ children }) => (
            <h3
              style={{
                margin: "12px 0 8px 0",
                fontSize: "13px",
                fontWeight: "700",
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {children}
            </h3>
          ),
          hr: () => (
            <hr style={{ border: "none", borderTop: "1px solid #2A2A2A", margin: "10px 0" }} />
          ),
        }}
      >
        {parsed.markdown}
      </ReactMarkdown>
      {parsed.ctas.map((cta) => (
        <button
          key={cta}
          type="button"
          onClick={() => onCtaPress(cta)}
          style={{
            border: "1px solid #444",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            color: "#FFFFFF",
            background: "transparent",
            display: "inline-block",
            marginTop: "8px",
            cursor: "pointer",
          }}
        >
          {cta}
        </button>
      ))}
    </div>
  );
}

function parseRiaMessage(text: string): ParsedRiaMessage {
  const lines = text.split(/\r?\n/);
  const ctas: string[] = [];
  const markdownLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("[CTA]")) {
      const cta = line.slice(5).trim();
      if (cta) ctas.push(cta);
      continue;
    }
    markdownLines.push(line);
  }

  return {
    markdown: markdownLines.join("\n").trim(),
    ctas,
  };
}

async function handleCtaPress(
  cta: string,
  send: (text: string) => Promise<void>,
  onOpenChange: (open: boolean) => void,
) {
  if (/zomato/i.test(cta)) {
    const query = cta.replace(/order\s+/i, "").replace(/\s+on zomato/i, "").trim() || cta;
    window.open(`https://zomato.com/search?q=${encodeURIComponent(query)}`, "_blank");
    return;
  }

  if (/swiggy/i.test(cta)) {
    const query = cta.replace(/order\s+/i, "").replace(/\s+on swiggy/i, "").trim() || cta;
    window.open(`https://swiggy.com/search?query=${encodeURIComponent(query)}`, "_blank");
    return;
  }

  if (/^log/i.test(cta)) {
    window.location.href = "/log-meal";
    onOpenChange(false);
    return;
  }

  await send(cta);
}

function MealConfirmCard({
  payload,
  onConfirm,
  onEdit,
}: {
  payload: ReturnType<typeof detectFoodLog>;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  const total = payload.detectedFoods.reduce(
    (acc, f) => {
      acc.cal += f.calories;
      acc.protein += f.protein_g;
      return acc;
    },
    { cal: 0, protein: 0 },
  );

  return (
    <div className="rounded-2xl border border-white bg-white p-4">
      <p className="text-sm font-semibold">got it, here&apos;s what i&apos;m adding</p>
      <div className="mt-3 space-y-1">
        {payload.detectedFoods.map((food) => (
          <p key={food.name} className="text-xs text-black">
            {food.name} ({food.size}) - {formatInt(food.calories)} kcal - {food.protein_g}g protein
          </p>
        ))}
      </div>
      <div className="mt-2 border-t border-[#D4D4D8] pt-2 text-sm font-semibold">
        total: {formatInt(total.cal)} kcal - {formatInt(total.protein)}g protein
      </div>
      {payload.mentionedCost > 0 ? (
        <p className="mt-1 text-xs text-black">cost: Rs{formatInt(payload.mentionedCost)}</p>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="h-10 bg-white text-black" onPress={onConfirm}>
          looks right
        </Button>
        <Button className="h-10 border border-[#D4D4D8] bg-transparent text-black" onPress={onEdit}>
          edit
        </Button>
      </div>
    </div>
  );
}
