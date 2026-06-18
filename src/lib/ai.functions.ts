import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const RESPONSIBLE_AI_SUFFIX =
  "\n\nReminder: AI-generated content may contain inaccuracies. Review carefully before use.";

async function runPrompt(system: string, prompt: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    throw new Error("AI is not configured. Missing LOVABLE_API_KEY.");
  }
  const { createLovableAiGatewayProvider, DEFAULT_MODEL } = await import("./ai-gateway.server");
  const gateway = createLovableAiGatewayProvider(key);
  try {
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system,
      prompt,
    });
    return text.trim() + RESPONSIBLE_AI_SUFFIX;
  } catch (err: unknown) {
    const e = err as { statusCode?: number; status?: number; message?: string };
    const code = e.statusCode ?? e.status;
    if (code === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
    if (code === 402)
      throw new Error("AI credits exhausted. Add credits in your Lovable workspace to continue.");
    throw new Error(e.message ?? "AI request failed.");
  }
}

/* ---------- Smart Email ---------- */
const EmailInput = z.object({
  purpose: z.string().min(1).max(500),
  recipient: z.string().min(1).max(200),
  keyPoints: z.string().min(1).max(2000),
  tone: z.enum(["formal", "friendly", "persuasive", "professional", "apologetic"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You are an executive communications assistant. Write polished, concise, workplace-appropriate emails. " +
      "Always output in this exact markdown structure:\n\n" +
      "**Subject:** <subject line>\n\n" +
      "<email body — 2-4 short paragraphs>\n\n" +
      "<professional closing with name placeholder>";
    const prompt =
      `Write an email with these details.\n` +
      `Purpose: ${data.purpose}\n` +
      `Recipient: ${data.recipient}\n` +
      `Tone: ${data.tone}\n` +
      `Key points to include:\n${data.keyPoints}`;
    return { text: await runPrompt(system, prompt) };
  });

/* ---------- Meeting Summarizer ---------- */
const MeetingInput = z.object({
  notes: z.string().min(20).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You summarize workplace meeting notes. Always output markdown with these exact section headings, in order:\n" +
      "## Summary\n## Key Decisions\n## Action Items\n## Deadlines\n## Follow-Up Tasks\n\n" +
      "Use bullet points under each. Be precise and brief. If a section has no content, write '- None identified.'";
    const prompt = `Meeting notes:\n\n${data.notes}`;
    return { text: await runPrompt(system, prompt) };
  });

/* ---------- Task Planner ---------- */
const TaskInput = z.object({
  tasks: z.string().min(5).max(5000),
  deadlines: z.string().max(2000).optional().default(""),
  priority: z.enum(["high", "medium", "low", "mixed"]).default("mixed"),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TaskInput.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You are an executive productivity coach. Build practical schedules. Always output markdown with these exact section headings, in order:\n" +
      "## Daily Schedule\n## Weekly Plan\n## Priority Ranking\n## Recommended Focus Areas\n## Estimated Time Allocation\n\n" +
      "Use clear bullet points. Include realistic time estimates and respect deadlines.";
    const prompt =
      `Tasks:\n${data.tasks}\n\nDeadlines:\n${data.deadlines || "(not specified)"}\n\n` +
      `Overall priority emphasis: ${data.priority}.`;
    return { text: await runPrompt(system, prompt) };
  });

/* ---------- Research ---------- */
const ResearchInput = z.object({
  topic: z.string().min(3).max(1000),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You are a workplace research assistant. Provide grounded, neutral, business-relevant overviews. " +
      "Always output markdown with these exact section headings, in order:\n" +
      "## Overview\n## Key Points\n## Insights\n## Recommendations\n## Suggested Next Steps\n\n" +
      "Use bullets where helpful. Note when information may be uncertain.";
    const prompt = `Topic or question: ${data.topic}`;
    return { text: await runPrompt(system, prompt) };
  });
