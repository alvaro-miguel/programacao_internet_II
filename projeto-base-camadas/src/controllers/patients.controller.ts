import { Request, Response } from "express";
import { getAllPatients, getPatientById, createPatient } from "../services/patients.service.ts";

export const patientsController = {
  list(request: Request, response: Response) {
    const patients = getAllPatients();
    response.status(200).json(patients);
  },

  getOne(request: Request, response: Response) {
    const patient = getPatientById(request.params.id as string);
    if (!patient) {
      response.status(404).json({ error: "Paciente nao encontrado." });
      return;
    }
    response.status(200).json(patient);
  },

  create(request: Request, response: Response) {
    const result = createPatient(request.body);
    if (result.error) {
      response.status(result.status).json({ error: result.error });
      return;
    }
    response.status(result.status).json(result.data);
  }
};
