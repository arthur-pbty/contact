import { Pool } from "pg";

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return url;
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }
  return pool;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await getPool().connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS contact_messages (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            project TEXT NOT NULL,
            request_type TEXT NOT NULL,
            message TEXT NOT NULL,
            source_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            replied_at TIMESTAMPTZ,
            admin_reply TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'replied'))
          );
        `);

        await client.query(`
          ALTER TABLE contact_messages
          ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'replied'));
        `);

        await client.query(`
          UPDATE contact_messages
          SET status = CASE WHEN replied_at IS NULL THEN 'pending' ELSE 'replied' END
          WHERE status IS DISTINCT FROM CASE WHEN replied_at IS NULL THEN 'pending' ELSE 'replied' END;
        `);
      } finally {
        client.release();
      }
    })();
  }

  await schemaReady;
}

export type ContactMessageRow = {
  id: number;
  name: string;
  email: string;
  project: string;
  request_type: string;
  message: string;
  source_url: string | null;
  created_at: string;
  replied_at: string | null;
  admin_reply: string | null;
  status: "pending" | "replied";
};

export async function createMessage(input: {
  name: string;
  email: string;
  project: string;
  requestType: string;
  message: string;
  sourceUrl?: string | null;
}) {
  await ensureSchema();
  const result = await getPool().query<ContactMessageRow>(
    `
      INSERT INTO contact_messages (name, email, project, request_type, message, source_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [input.name, input.email, input.project, input.requestType, input.message, input.sourceUrl ?? null],
  );

  return result.rows[0];
}

export async function listMessages() {
  await ensureSchema();
  const result = await getPool().query<ContactMessageRow>(
    `
      SELECT *
      FROM contact_messages
      ORDER BY created_at DESC
    `,
  );

  return result.rows;
}

export async function getMessageById(id: number) {
  await ensureSchema();
  const result = await getPool().query<ContactMessageRow>(
    `
      SELECT *
      FROM contact_messages
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function markMessageReply(id: number, reply: string) {
  await ensureSchema();
  const result = await getPool().query<ContactMessageRow>(
    `
      UPDATE contact_messages
      SET admin_reply = $2,
          replied_at = NOW(),
          status = 'replied'
      WHERE id = $1
      RETURNING *
    `,
    [id, reply],
  );

  return result.rows[0] ?? null;
}

export async function setMessageStatus(id: number, status: "pending" | "replied") {
  await ensureSchema();

  const result = await getPool().query<ContactMessageRow>(
    `
      UPDATE contact_messages
      SET status = $2,
          replied_at = CASE WHEN $2 = 'replied' THEN COALESCE(replied_at, NOW()) ELSE NULL END,
          admin_reply = CASE WHEN $2 = 'pending' THEN admin_reply ELSE admin_reply END
      WHERE id = $1
      RETURNING *
    `,
    [id, status],
  );

  return result.rows[0] ?? null;
}

export async function deleteMessage(id: number) {
  await ensureSchema();

  const result = await getPool().query<{ id: number }>(
    `
      DELETE FROM contact_messages
      WHERE id = $1
      RETURNING id
    `,
    [id],
  );

  return Boolean(result.rows[0]);
}
