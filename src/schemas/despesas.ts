import * as z from "zod";

export const CATEGORIAS_VALIDAS = ["ALIMENTACAO", "DOMESTICAS", "ASSINATURAS", "LAZER", "OUTROS"] as const;

//O valor chega já convertido em centavos pela action, porque a conversão depende
//do formato digitado (vírgula ou ponto) e não cabe no schema.
export const despesaSchema = z.object({
    name: z.string()
        .trim()
        .min(2, "O nome da despesa deve ter no mínimo 2 caracteres")
        .max(60, "O nome da despesa deve ter no máximo 60 caracteres"),
    valueInCents: z.number()
        .int()
        .positive("O valor deve ser maior que zero"),
    category: z.enum(CATEGORIAS_VALIDAS, { message: "Selecione uma categoria" }),
    isRecurring: z.boolean(),
});
