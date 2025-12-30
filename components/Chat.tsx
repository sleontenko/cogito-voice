"use client";

import { VoiceProvider, ToolCallHandler } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useRef } from "react";

type ToolMeta = {
  endpoint: string;
  error: {
    error: string;
    code: string;
    level: "warn" | "error";
    content: string;
  };
};

const tools: Record<string, ToolMeta> = {
  search_vault_v2: {
    endpoint: "/api/vault/search",
    error: {
      error: "Search error",
      code: "search_error",
      level: "warn",
      content: "Unable to search vault",
    },
  },
  get_today_note_v3: {
    endpoint: "/api/vault/today",
    error: {
      error: "Today note error",
      code: "today_error",
      level: "warn",
      content: "Unable to get today's note",
    },
  },
  read_note_v2: {
    endpoint: "/api/vault/read",
    error: {
      error: "Read error",
      code: "read_error",
      level: "warn",
      content: "Unable to read note",
    },
  },
  get_context: {
    endpoint: "/api/state/context",
    error: {
      error: "Context error",
      code: "context_error",
      level: "warn",
      content: "Unable to get context",
    },
  },
  save_weekly_focus: {
    endpoint: "/api/state/weekly-focus",
    error: {
      error: "Save error",
      code: "save_error",
      level: "warn",
      content: "Unable to save weekly focus",
    },
  },
};

const handleToolCall: ToolCallHandler = async (message, send) => {
  console.log("Tool call received:", message.name, message.parameters);

  const tool = tools[message.name];

  if (!tool) {
    console.log("Tool not found:", message.name);
    return send.error({
      error: "Tool not found",
      code: "tool_not_found",
      level: "warn",
      content: "The tool you requested was not found",
    });
  }

  try {
    const response = await fetch(tool.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parameters: message.parameters }),
    });

    const result = await response.json();
    console.log("Tool result:", result);

    return result.success
      ? send.success(result.data)
      : send.error(result.error);
  } catch (err) {
    console.error("Tool call error:", err);
    return send.error(tool.error);
  }
};

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

  return (
    <div
      className={
        "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"
      }
    >
      <VoiceProvider
        onToolCall={handleToolCall}
        onOpen={() => {
          console.log("VoiceProvider: Connection opened!");
        }}
        onClose={(event) => {
          console.log("VoiceProvider: Connection closed", event);
        }}
        onError={(err) => {
          console.error("VoiceProvider error:", err);
        }}
        onMessage={(msg) => {
          console.log("VoiceProvider message:", msg);
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;

              ref.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
      >
        <Messages ref={ref} />
        <Controls />
        <StartCall accessToken={accessToken} />
      </VoiceProvider>
    </div>
  );
}
