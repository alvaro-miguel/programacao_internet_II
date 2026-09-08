import { error } from "console";
import { db } from "../db/database.ts";
import { NotFoundError, BadRequestError, ConflictError } from "../errors/HttpError.ts";

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

export function getAllPatients() {
  const rows = db.prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients ORDER BY name").all() as PatientRow[];
  return rows.map(toPatientJson);
}

export function getPatientById(id: string) {
  const row = db.prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?").get(id) as PatientRow | undefined;

  if (!row){
    throw new NotFoundError("Paciente não encontrado");
  }
  
  return toPatientJson(row);
}

export function createPatient(data: any) {

  const { name, birthDate, nationalId } = data;
  const duplicate = db.prepare("SELECT id FROM patients WHERE national_id = ?").get(nationalId.trim());
  if(duplicate){
    throw new ConflictError("Ja existe um paciente co este CNS");
  }

  const result = db.prepare(`INSERT INTO patients (name, birth_date, national_id, active) VALUES (?, ?, ?, 1)`).run(name.trim(), birthDate, nationalId.trim());
  const created = db.prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?").get(result.lastInsertRowid) as PatientRow;

    return toPatientJson(created);

}
