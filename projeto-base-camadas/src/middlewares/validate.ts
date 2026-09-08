/**
 * ============================================================
 * TODO 11 (Encontro 2) -- Middleware de validacao genÃ©rico
 * ============================================================
 * So depois do TODO 10 (schema) e do TODO 8 (BadRequestError).
 *
 * function validate(schema) {
 *   return (req, res, next) => {
 *     const result = schema.safeParse(req.body);
 *     if (!result.success) throw new BadRequestError(..., result.error.flatten().fieldErrors);
 *     req.body = result.data;
 *     next();
 *   };
 * }
 * ============================================================
 */

import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { BadRequestError } from "../errors/HttpError.ts";

export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.issues.map((issue) => issue.message);
        
        next(new BadRequestError("Erro de validacao.", errorDetails));
      } else {
        next(error);
      }
    }
  };
}
