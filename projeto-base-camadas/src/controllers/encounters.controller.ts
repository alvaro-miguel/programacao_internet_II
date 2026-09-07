/**
 * ============================================================
 * TODO 5 -- Controller de Encounter
 * ============================================================
 * Mesma regra do TODO 2: traduz HTTP <-> dominio, chama o
 * Service (TODO 6), nunca acessa o banco diretamente.
 *
 * Repare que aqui o id do paciente vem de req.params.id (por
 * causa do mergeParams no TODO 4) -- e nao de um :patientId
 * separado.
 *
 *   import { encountersService } from "../services/encounters.service.ts";
 *
 *   export const encountersController = {
 *     list(req, res) { ... },
 *     create(req, res) { ... },
 *   };
 * ============================================================
 */

import { Request, Response } from "express";
import { getEncountersByPatient, createEncounter } from "../services/encounters.service";

export const encountersController = {
  list(request: Request, response: Response) {
    const encounters = getEncountersByPatient(request.params.id as string);
    if (!encounters) {
      response.status(404).json({ error: "Paciente nao encontrado." });
      return;
    }
    response.status(200).json(encounters);
  },

  create(request: Request, response: Response) {
    const result = createEncounter(request.params.id as string, request.body);
    if (result.error) {
      response.status(result.status).json({ error: result.error });
      return;
    }
    response.status(result.status).json(result.data);
  }
};
