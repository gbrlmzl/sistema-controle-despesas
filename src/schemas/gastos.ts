import * as z from "zod";

const despesaSchema = z.object({
    identificacao: z.string().min(1).max(200),
    valor: z.number().positive(),
})

export const pessoaDespesasSchema = z.object({
    idPessoa: z.number().int().positive(),
    nomePessoa: z.string().min(1).max(100),
    despesas: z.array(despesaSchema).max(200),
    somaDespesas: z.number().min(0),
    quantDespesas: z.number().int().nonnegative(),
});


export const gastosPayloadSchema = z.object({
    lista: z.array(pessoaDespesasSchema).min(1).max(9),
    mes: z.number().int().min(1).max(12),
    ano: z.number().int().min(2000).max(2100),
});