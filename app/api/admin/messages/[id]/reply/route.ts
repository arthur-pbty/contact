import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getMessageById, markMessageReply } from "@/lib/db";

async function sendReplyEmail(input: { to: string; reply: string; senderName: string; originalMessage: string }) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP non configure pour les reponses admin.");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number.isNaN(smtpPort) ? 587 : smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser;
  const escapedOriginal = input.originalMessage
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const escapedReply = input.reply
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  await transporter.sendMail({
    from: fromEmail,
    to: input.to,
    subject: "Reponse a votre message",
    text: [
      `Bonjour ${input.senderName},`,
      "",
      "Merci pour votre message. Voici ma reponse:",
      "",
      input.reply,
      "",
      "---------------------------",
      "Votre message initial:",
      input.originalMessage,
      "---------------------------",
      "",
      "ArthurP",
    ].join("\n"),
    html: `
      <div style="font-family: Inter, Segoe UI, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Reponse a votre message</h2>
        <p style="margin: 0 0 16px;">Bonjour ${input.senderName},</p>
        <p style="margin: 0 0 8px;">Merci pour votre message. Voici ma reponse:</p>
        <div style="margin: 0 0 20px; padding: 12px 14px; background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 10px; white-space: pre-wrap;">${escapedReply}</div>
        <p style="margin: 0 0 8px; font-weight: 600;">Votre message initial:</p>
        <div style="margin: 0; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; white-space: pre-wrap;">${escapedOriginal}</div>
        <p style="margin: 20px 0 0; font-size: 13px; color: #475569;">ArthurP</p>
      </div>
    `,
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const messageId = Number(id);
  if (!Number.isInteger(messageId) || messageId <= 0) {
    return NextResponse.json({ message: "ID invalide." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { reply?: string } | null;
  const reply = body?.reply?.trim() || "";
  if (reply.length < 5) {
    return NextResponse.json({ message: "Reponse trop courte." }, { status: 400 });
  }

  const existing = await getMessageById(messageId);
  if (!existing) {
    return NextResponse.json({ message: "Message introuvable." }, { status: 404 });
  }

  try {
    await sendReplyEmail({
      to: existing.email,
      reply,
      senderName: existing.name,
      originalMessage: existing.message,
    });
    await markMessageReply(messageId, reply);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Impossible d'envoyer la reponse.",
      },
      { status: 500 },
    );
  }
}
