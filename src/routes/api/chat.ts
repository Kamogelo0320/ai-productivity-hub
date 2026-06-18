import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

type Body = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const { createLovableAiGatewayProvider, DEFAULT_MODEL } = await import(
          "@/lib/ai-gateway.server"
        );
        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway(DEFAULT_MODEL),
            system:
              "You are Synapse, an AI workplace productivity assistant. Help professionals " +
              "draft emails, summarize meetings, plan tasks, conduct research, and prepare for work. " +
              "Be concise, practical, and friendly. Use markdown for structure when helpful. " +
              "Remind the user when verification matters for high-stakes decisions.",
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (err: unknown) {
          const e = err as { statusCode?: number; status?: number; message?: string };
          const code = e.statusCode ?? e.status;
          if (code === 429)
            return new Response("Rate limit reached. Please try again shortly.", { status: 429 });
          if (code === 402)
            return new Response("AI credits exhausted. Add credits to continue.", { status: 402 });
          return new Response(e.message ?? "AI request failed", { status: 500 });
        }
      },
    },
  },
});
