/**
 * ============================================================
 * TODO 6 -- Service de Encounter
 * ============================================================
 * Migre para ca: a verificacao patientExists, a query de list
 * (ordenada por started_at DESC), a validacao + insert de
 * create, e a funcao toEncounterJson.
 *
 *   export const encountersService = {
 *     list(patientId: string) { ... },
 *     create(patientId: string, data: { startedAt: string; chiefComplaint: string; notes?: string }) { ... },
 *   };
 * ============================================================
 */

import { db } from "../db/database";
import { NotFoundError, BadRequestError } from "../errors/HttpError";

export type EncounterRow = {
  id: number;
  patient_id: number;
  started_at: string;
  chief_complaint: string;
  notes: string | null;
};

export function toEncounterJson(row: EncounterRow) {
  return {
    id: row.id,
    patientId: row.patient_id,
    startedAt: row.started_at,
    chiefComplaint: row.chief_complaint,
    notes: row.notes,
  };
}

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
function isBlank(value: unknown): boolean { return typeof value !== "string" || value.trim() === ""; }
function patientExists(id: string): boolean { return db.prepare("SELECT 1 FROM patients WHERE id = ?").get(id) !== undefined; }

export function getEncountersByPatient(patientId: string) {
  if (!patientExists(patientId)){
    throw new NotFoundError("Paciente nao encontrado");
  }

  const rows = db.prepare(`SELECT id, patient_id, started_at, chief_complaint, notes FROM encounters WHERE patient_id = ? ORDER BY started_at DESC`).all(patientId) as EncounterRow[];
  return rows.map(toEncounterJson);
}

export function createEncounter(patientId: string, data: any) {
  if (!patientExists(patientId)) {
    throw new NotFoundError("Paciente nao encontrado");
  }

  const { startedAt, chiefComplaint, notes } = data ?? {};
  if (isBlank(chiefComplaint)){
    throw new BadRequestError("O campo 'chiefComplaint' e obrigatorio");
  }

  if (isBlank(startedAt) || !ISO_DATE_TIME.test(startedAt)) {
    throw new BadRequestError("O campo 'startedAt' e obrigatorio no formato AAAA-MM-DDTHH:MM");
  }

  const result = db.prepare(`INSERT INTO encounters (patient_id, started_at, chief_complaint, notes) VALUES (?, ?, ?, ?)`).run(patientId, startedAt, chiefComplaint.trim(), isBlank(notes) ? null : notes.trim());
  const created = db.prepare(`SELECT id, patient_id, started_at, chief_complaint, notes FROM encounters WHERE id = ?`).get(result.lastInsertRowid) as EncounterRow;

  return toEncounterJson(created);
}
