import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listMessages } from "@/lib/db";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const messages = await listMessages();

  return NextResponse.json({
    messages: messages.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      project: row.project,
      requestType: row.request_type,
      message: row.message,
      createdAt: row.created_at,
      repliedAt: row.replied_at,
      adminReply: row.admin_reply,
      status: row.status,
    })),
  });
}
