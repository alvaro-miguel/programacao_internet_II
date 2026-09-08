import { Request, Response } from "express";
import { getAllPatients, getPatientById, createPatient } from "../services/patients.service.ts";

export const patientsController = {
  list(request: Request, response: Response) {
    const patients = getAllPatients();
    response.status(200).json(patients);
  },

  getOne(request: Request, response: Response) {
    const patient = getPatientById(request.params.id as string);
    response.status(200).json(patient);
  },

  create(request: Request, response: Response) {
    const created = createPatient(request.body);
    response.status(201).json(created);
  }
};
