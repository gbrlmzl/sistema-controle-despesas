import * as z from "zod";

const pessoaSchema = z.object({
    nome: z.string().min(1).max(100),
    email: z.email().max(200),
});

export const pessoasPayloadSchema = z.array(pessoaSchema).min(2).max(9);

