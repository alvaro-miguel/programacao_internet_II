/**
 * ============================================================
 * TODO 10 (Encontro 2) -- Schema Zod de Patient
 * ============================================================
 * export const createPatientSchema = z.object({ ... });
 *
 * Campos: name (string, min 1), birthDate (string, formato
 * AAAA-MM-DD), nationalId (string).
 *
 * Depois de escrever o schema, use-o no TODO 11 (middleware
 * validate) e monte na rota de criar paciente:
 *   patientsRouter.post("/", validate(createPatientSchema), patientsController.create);
 * ============================================================
 */

import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const createPatientSchema = z.object({
  name: z.string({ required_error: "O campo 'name' e obrigatorio." })
         .min(1, "O campo 'name' nao pode ser vazio."),
         
  birthDate: z.string({ required_error: "O campo 'birthDate' e obrigatorio." })
              .regex(ISO_DATE, "O campo 'birthDate' deve estar no formato AAAA-MM-DD."),
              
  nationalId: z.string({ required_error: "O campo 'nationalId' e obrigatorio." })
               .min(1, "O campo 'nationalId' e obrigatorio.")
});