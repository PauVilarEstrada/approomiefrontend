// src/schemas/provider.schema.ts

import { z } from "zod";

/**
 * stayOptions debe ser un tuple literal para que Zod lo reconozca correctamente.
 * Incluimos "1", "2", ..., "24", luego "Indefinido" y "Otro".
 */
export const stayOptions = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24",
  "Indefinido",
  "Otro"
] as const;

/**
 * Schéma Zod completo para el formulario “Ofrezco habitación”.
 * - spaceDesc: descripción textual del espacio (mín. 10 caracteres).
 * - rent: número ≥ 0.
 * - expenses: número ≥ 0.
 * - area: cadena no vacía.
 * - availability: fecha igual o posterior a hoy.
 * - minStay: uno de stayOptions (obligatorio).
 * - maxStay: uno de stayOptions (opcional).
 * - allowsPets: booleano.
 * - features: arreglo de strings no vacíos, al menos 1.
 * - restrictions: arreglo de strings no vacíos (opcional).
 * - genderPref: cadena no vacía.
 * - roomPhotos: arreglo de URLs válidas, de 2 a 15 elementos.
 * - profilePhotos: arreglo de URLs válidas, como máximo 5 (opcional).
 * - roomVideo: URL válida (opcional).
 */
export const providerSchema = z.object({
  spaceDesc: z
    .string()
    .min(10, "Descripción del espacio demasiado corta (mín. 10 caracteres)"),

  rent: z
    .number({ invalid_type_error: "La renta debe ser un número" })
    .min(0, "La renta no puede ser negativa"),

  expenses: z
    .number({ invalid_type_error: "Los gastos deben ser un número" })
    .min(0, "Los gastos no pueden ser negativos"),

  area: z.string().min(1, "Área / ubicación obligatoria"),

  availability: z
    .date()
    .refine(
      (fecha) => {
        // Comparamos solamente la parte de año/mes/día:
        const hoy = new Date();
        // Normalizar horas a medianoche para comparar solo fecha
        hoy.setHours(0, 0, 0, 0);
        fecha.setHours(0, 0, 0, 0);
        return fecha >= hoy;
      },
      { message: "La fecha de disponibilidad debe ser hoy o futura" }
    ),

  // Ahora minStay y maxStay son cadenas tomadas de stayOptions.
  minStay: z.enum(stayOptions, {
    errorMap: () => ({ message: "Seleccione un mínimo de estancia válido" })
  }),

  maxStay: z
    .enum(stayOptions, {
      errorMap: () => ({ message: "Seleccione un máximo de estancia válido" })
    })
    .optional(),

  allowsPets: z.boolean(),

  features: z
    .array(z.string().min(1, "Cada característica no puede estar vacía"))
    .min(1, "Debe agregar al menos 1 característica"),

  restrictions: z
    .array(z.string().min(1, "Cada restricción no puede estar vacía"))
    .optional(),

  genderPref: z.string().min(1, "Preferencia de género obligatoria"),

  roomPhotos: z
    .array(z.string().url("Cada foto debe ser una URL válida"))
    .min(2, "Debe subir al menos 2 fotos de la habitación")
    .max(15, "Máximo 15 fotos"),

  profilePhotos: z
    .array(z.string().url("Cada foto debe ser una URL válida"))
    .max(5, "Máximo 5 fotos de perfil")
    .optional(),

  roomVideo: z
    .string()
    .url("La URL del video no es válida")
    .optional(),
});

export type ProviderForm = z.infer<typeof providerSchema>;
