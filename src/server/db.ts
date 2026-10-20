import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DATA_DIR, DATA_RETENTION_DAYS } from 'astro:env/server';
import type { RequestData } from '../lib/validation';

export type RequestStatus = 'novo' | 'em_atendimento' | 'concluido';
export const STATUSES: RequestStatus[] = ['novo', 'em_atendimento', 'concluido'];

export interface StoredRequest extends RequestData {
  id: number;
  status: RequestStatus;
  createdAt: string;
  emailSent: boolean;
}

let db: DatabaseSync | null = null;

function connect(): DatabaseSync {
  if (db) return db;
  const dir = path.resolve(DATA_DIR || './data');
  mkdirSync(dir, { recursive: true });
  db = new DatabaseSync(path.join(dir, 'solicitacoes.db'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      status TEXT NOT NULL DEFAULT 'novo',
      subject TEXT NOT NULL,
      name TEXT NOT NULL,
      contact TEXT NOT NULL,
      contact_type TEXT NOT NULL,
      check_in TEXT,
      check_out TEXT,
      adults INTEGER,
      children INTEGER,
      room_id TEXT,
      message TEXT NOT NULL DEFAULT '',
      email_sent INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_requests_created ON requests (created_at);
  `);
  purgeOld();
  return db;
}

/** Exclui solicitações antigas (LGPD — minimização de dados). */
export function purgeOld(): number {
  const days = DATA_RETENTION_DAYS ?? 180;
  if (!db || days <= 0) return 0;
  const result = db
    .prepare(`DELETE FROM requests WHERE created_at < strftime('%Y-%m-%dT%H:%M:%SZ', 'now', ?)`)
    .run(`-${Math.floor(days)} days`);
  return Number(result.changes);
}

export function insertRequest(data: RequestData): number {
  const result = connect()
    .prepare(
      `INSERT INTO requests (subject, name, contact, contact_type, check_in, check_out, adults, children, room_id, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      data.subject,
      data.name,
      data.contact,
      data.contactType,
      data.checkIn,
      data.checkOut,
      data.adults,
      data.children,
      data.roomId,
      data.message,
    );
  return Number(result.lastInsertRowid);
}

export function markEmailSent(id: number) {
  connect().prepare('UPDATE requests SET email_sent = 1 WHERE id = ?').run(id);
}

type Row = Record<string, string | number | null>;

const toRequest = (row: Row): StoredRequest => ({
  id: Number(row.id),
  createdAt: String(row.created_at),
  status: row.status as RequestStatus,
  subject: row.subject as StoredRequest['subject'],
  name: String(row.name),
  contact: String(row.contact),
  contactType: row.contact_type as StoredRequest['contactType'],
  checkIn: (row.check_in as string) ?? null,
  checkOut: (row.check_out as string) ?? null,
  adults: row.adults === null ? null : Number(row.adults),
  children: row.children === null ? null : Number(row.children),
  roomId: (row.room_id as string) ?? null,
  message: String(row.message ?? ''),
  emailSent: Number(row.email_sent) === 1,
});

export function listRequests(status?: RequestStatus, limit = 200): StoredRequest[] {
  const conn = connect();
  purgeOld();
  const rows = status
    ? conn.prepare('SELECT * FROM requests WHERE status = ? ORDER BY id DESC LIMIT ?').all(status, limit)
    : conn.prepare('SELECT * FROM requests ORDER BY id DESC LIMIT ?').all(limit);
  return (rows as Row[]).map(toRequest);
}

export function countByStatus(): Record<RequestStatus, number> {
  const rows = connect().prepare('SELECT status, COUNT(*) AS total FROM requests GROUP BY status').all() as Row[];
  const counts = { novo: 0, em_atendimento: 0, concluido: 0 };
  rows.forEach((row) => {
    if (STATUSES.includes(row.status as RequestStatus)) counts[row.status as RequestStatus] = Number(row.total);
  });
  return counts;
}

export function updateStatus(id: number, status: RequestStatus): boolean {
  if (!STATUSES.includes(status)) return false;
  return Number(connect().prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, id).changes) > 0;
}

export function deleteRequest(id: number): boolean {
  return Number(connect().prepare('DELETE FROM requests WHERE id = ?').run(id).changes) > 0;
}
