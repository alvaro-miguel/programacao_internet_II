import { db } from "../db/database.ts";

export type PatientRow = {
  id: number;
  name: string;
  birth_date: string;
  national_id: string;
  active: number;
  photo_path: string | null;
};

export function toPatientJson(row: PatientRow) {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    nationalId: row.national_id,
    active: row.active === 1,
    photoUrl: row.photo_path,
  };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function isBlank(value: unknown): boolean { return typeof value !== "string" || value.trim() === ""; }

export function validatePatientInput(body: any): string | null {
  if (isBlank(body?.name)) return "O campo 'name' e obrigatorio e nao pode ser vazio.";
  if (isBlank(body?.birthDate) || !ISO_DATE.test(body.birthDate)) return "O campo 'birthDate' e obrigatorio e deve estar no formato AAAA-MM-DD.";
  if (isBlank(body?.nationalId)) return "O campo 'nationalId' e obrigatorio.";
  return null;
}

export function getAllPatients() {
  const rows = db.prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients ORDER BY name").all() as PatientRow[];
  return rows.map(toPatientJson);
}

export function getPatientById(id: string) {
  const row = db.prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?").get(id) as PatientRow | undefined;
  if (!row) return null;
  return toPatientJson(row);
}

export function createPatient(data: any) {
  const problem = validatePatientInput(data);
  if (problem) return { error: problem, status: 400 };

  const { name, birthDate, nationalId } = data;
  const duplicate = db.prepare("SELECT id FROM patients WHERE national_id = ?").get(nationalId.trim());
  if (duplicate) return { error: "Ja existe um paciente com este CNS.", status: 409 };

  const result = db.prepare(`INSERT INTO patients (name, birth_date, national_id, active) VALUES (?, ?, ?, 1)`).run(name.trim(), birthDate, nationalId.trim());
  const created = db.prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?").get(result.lastInsertRowid) as PatientRow;
  
  return { data: toPatientJson(created), status: 201 };
}
