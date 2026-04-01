import { z } from "zod";
import { normalizeProjectParam, PROJECT_LABELS, PROJECT_VALUES } from "@/lib/sites";

export const requestTypeValues = ["bug", "question", "suggestion", "other"] as const;

export type RequestTypeValue = (typeof requestTypeValues)[number];

export const projectValues = PROJECT_VALUES;

export const REQUEST_TYPE_LABELS: Record<RequestTypeValue, string> = {
  bug: "Bug 🐛",
  question: "Question ❓",
  suggestion: "Suggestion 💡",
  other: "Autre",
};

export const contactPayloadSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis").max(80, "Nom trop long"),
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis")
    .email("Email invalide")
    .max(160, "Email trop long"),
  project: z.enum(projectValues, {
    error: "Projet invalide",
  }),
  requestType: z.enum(requestTypeValues, {
    error: "Type de demande invalide",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Le message doit contenir au moins 10 caracteres")
    .max(3000, "Le message est trop long"),
  honeypot: z
    .string()
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value.trim().length === 0, "Spam detecte"),
  sourceUrl: z
    .string()
    .trim()
    .max(500, "URL trop longue")
    .optional()
    .transform((value) => value ?? ""),
});

export type ContactPayload = z.infer<typeof contactPayloadSchema>;

export { normalizeProjectParam, PROJECT_LABELS };
