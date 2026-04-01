import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";
import {
  contactPayloadSchema,
  PROJECT_LABELS,
  REQUEST_TYPE_LABELS,
  type ContactPayload,
} from "@/lib/contact";
import { createMessage } from "@/lib/db";

export const runtime = "nodejs";

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 5;
const requestTracker = new Map<string, number[]>();

function getClientIdentifier(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const recentRequests = (requestTracker.get(identifier) || []).filter(
    (timestamp) => now - timestamp <= RATE_WINDOW_MS,
  );

  if (recentRequests.length >= RATE_MAX_REQUESTS) {
    requestTracker.set(identifier, recentRequests);
    return true;
  }

  recentRequests.push(now);
  requestTracker.set(identifier, recentRequests);
  return false;
}

function formatMessage(payload: ContactPayload): string {
  return [
    `Nom: ${payload.name}`,
    `Email: ${payload.email}`,
    `Projet: ${PROJECT_LABELS[payload.project]}`,
    `Type: ${REQUEST_TYPE_LABELS[payload.requestType]}`,
    `Source: ${payload.sourceUrl || "non renseignee"}`,
    "Message:",
    payload.message,
  ].join("\n");
}

async function sendEmail(payload: ContactPayload, message: string): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPortRaw = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const contactTo = process.env.CONTACT_TO_EMAIL;

  if (!smtpHost || !smtpUser || !smtpPass || !contactTo) {
    return false;
  }

  const smtpPort = Number(smtpPortRaw || "587");
  const secure = smtpPort === 465;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number.isNaN(smtpPort) ? 587 : smtpPort,
    secure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser;

  await transporter.sendMail({
    from: fromEmail,
    to: contactTo,
    replyTo: payload.email,
    subject: `[Contact] ${PROJECT_LABELS[payload.project]} - ${REQUEST_TYPE_LABELS[payload.requestType]}`,
    text: message,
    html: `<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap;">${message}</pre>`,
  });

  return true;
}

async function sendDiscordWebhook(payload: ContactPayload, message: string): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: "📬 Nouveau message depuis le formulaire de contact",
      embeds: [
        {
          title: `${PROJECT_LABELS[payload.project]} - ${REQUEST_TYPE_LABELS[payload.requestType]}`,
          description: `\`\`\`\n${message}\n\`\`\``,
          color: 65366,
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Discord webhook a retourne une erreur.");
  }

  return true;
}

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);

  if (isRateLimited(identifier)) {
    return NextResponse.json(
      { message: "Trop de tentatives. Merci de reessayer dans une minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Payload invalide." }, { status: 400 });
  }

  const parsed = contactPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Donnees invalides.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  if (payload.honeypot.trim().length > 0) {
    return NextResponse.json({ message: "Message envoye." }, { status: 200 });
  }

  const formattedMessage = formatMessage(payload);

  try {
    await createMessage({
      name: payload.name,
      email: payload.email,
      project: payload.project,
      requestType: payload.requestType,
      message: payload.message,
      sourceUrl: payload.sourceUrl || null,
    });
  } catch (error) {
    console.error("Contact API db error:", error);
    return NextResponse.json(
      { message: "Impossible d'enregistrer le message pour le moment." },
      { status: 500 },
    );
  }

  const notificationResults = await Promise.allSettled([
    sendEmail(payload, formattedMessage),
    sendDiscordWebhook(payload, formattedMessage),
  ]);

  notificationResults.forEach((result, index) => {
    if (result.status === "rejected") {
      const channel = index === 0 ? "email" : "discord";
      console.warn(`Contact API ${channel} notification failed:`, result.reason);
    }
  });

  return NextResponse.json({ message: "Message envoye avec succes." }, { status: 200 });
}
