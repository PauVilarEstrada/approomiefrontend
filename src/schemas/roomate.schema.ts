// src/schemas/roommate.schema.ts

import { z } from "zod";

export const roommateSchema = z.object({
  description: z
    .string()
    .min(10, "Descripción demasiado corta (mín. 10 caracteres)"),
  preferredArea: z.string().min(1, "Área preferida es obligatoria"),
  moveInDate: z
    .date()
    .refine((d) => d >= new Date(), "La fecha de mudanza debe ser hoy o futura"),
  stayDuration: z.string().min(1, "Duración de estancia obligatoria"),
  genderPref: z.string().min(1, "Preferencia de género obligatoria"),
  allowsPets: z.boolean(),
  profilePhotos: z
    .array(z.string().url())
    .min(1, "Debe agregar al menos 1 foto")
    .max(8, "Máximo 8 fotos")
});

export const stayOptions = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24",
  "Indefinido",
  "Otro"
] as const;

export type RoommateForm = z.infer<typeof roommateSchema>;
