/**
 * ============================================================
 * Painel de Medicacao - Servidor HTTP
 * ============================================================
 * Isto e um "Hello World": so a rota de saude e o servidor
 * estatico. As quatro rotas da atividade (listar, criar, obter
 * um, remover) ainda nao existem — sao o que voce vai construir.
 */
import express, { response } from "express";
import { db } from "./database";
import { error } from "node:console";
import { request } from "node:http";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

// ============================================================
// PASSO 1 — GET /api/medications
//   db.prepare("SELECT ... FROM medication_orders").all()
//   Nao esqueca de traduzir snake_case -> camelCase antes de responder.

function snakeToCamel(row: any){
  return{
    id: row.id,
    patientName: row.patient_name,
    medicationName: row.medication_name,
    dosage: row.dosage,
    route: row.route,
    scheduledAt: row.scheduled_at,
    notes: row.notes
  };
}

app.get("/api/medications", (_request, response) => {
  const rows = db.prepare(`SELECT id, patient_name, medication_name, dosage,
              route, scheduled_at, notes
         FROM medication_orders
        ORDER BY scheduled_at ASC`).all();

  response.status(200).json(rows.map(snakeToCamel));
});
// ============================================================

// ============================================================
// PASSO 3 — POST /api/medications
//   valide patientName, medicationName, dosage, route, scheduledAt
//   INSERT parametrizado -> responda 201 com o registro criado
function validateMedication(data: any){
  if (!data.patientName || data.patientName.trim() === '') return 'Nome do paciente é obrigatório.';
  if (!data.medicationName || data.medicationName.trim() === '') return 'Nome da medicação é obrigatório.';
  if (!data.dosage || data.dosage.trim() === '') return 'A dosagem é obrigatória.';
  if (!data.route || data.route.trim() === '') return 'A via de administração é obrigatória.';
  
  const regexData = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!data.scheduledAt || !regexData.test(data.scheduledAt)) {
    return 'Data de agendamento inválida. Use o formato YYYY-MM-DDTHH:MM.';
  }
  
  return null;
}


app.post('/api/medications', (request, response) => {
  const problem = validateMedication(request.body);
  if(problem){
    return response.status(400).json({error: problem});
  }

  const {patientName, medicationName, dosage, route, scheduledAt, notes} = request.body;

  const result = db.prepare(`INSERT INTO medication_orders (patient_name, medication_name, dosage, route, scheduled_at, notes) VALUES (?, ?, ?, ?, ?, ?)`).run(patientName, medicationName, dosage, route, scheduledAt, notes || null);

  const createdRow = db.prepare("SELECT * FROM medication_orders WHERE id = ?").get(result.lastInsertRowid);

  return response.status(201).json(snakeToCamel(createdRow));
});
// ============================================================

// ============================================================
// PASSO 4 — GET /api/medications/:id
//   db.prepare("SELECT ... WHERE id = ?").get(id)
//   undefined -> 404
// ============================================================

app.get('/api/medications/:id', (request, response) => {
  const id = request.params.id;

  const row = db.prepare("SELECT * FROM medication_orders WHERE id=?").get(id);

  if(!row){
    return response.status(404).json({ error: 'Prescrição não encontrada.' });
  }

  return response.status(200).json(snakeToCamel(row));
});

// ============================================================
// PASSO 5 — DELETE /api/medications/:id
//   db.prepare("DELETE FROM medication_orders WHERE id = ?").run(id)
//   responda 204, sem corpo
// ============================================================
app.delete('/api/medications/:id', (request, response) => {
  const id = request.params.id;

  const existing = db.prepare(`SELECT id FROM medication_orders WHERE id = ?`).get(id);

  if(!existing){
    return response.status(404).json({error: `Prescrição não encontrada.`});
  }

  db.prepare('DELETE FROM medication_orders WHERE id=?').run(id);

  return response.status(204).send();
})




app.listen(PORT, () => {
  console.log(`Painel de Medicacao no ar em http://localhost:${PORT}`);
});
