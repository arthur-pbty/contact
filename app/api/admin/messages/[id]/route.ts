import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteMessage } from "@/lib/db";

export async function DELETE(
  _request: Request,
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

  const deleted = await deleteMessage(messageId);
  if (!deleted) {
    return NextResponse.json({ message: "Message introuvable." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
