import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { setMessageStatus } from "@/lib/db";

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

  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  const status = body?.status;

  if (status !== "pending" && status !== "replied") {
    return NextResponse.json({ message: "Statut invalide." }, { status: 400 });
  }

  const updated = await setMessageStatus(messageId, status);
  if (!updated) {
    return NextResponse.json({ message: "Message introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
