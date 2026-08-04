import * as z from "zod";

//RN-003 -> Restrições do nome da residência.
//Nomes não precisam ser únicos: quem identifica a residência é o código (RN-006).
export const residenceNameSchema = z.string()
    .trim()
    .min(3, "O nome da residência deve ter no mínimo 3 caracteres")
    .max(40, "O nome da residência deve ter no máximo 40 caracteres")
    .regex(/^[\p{L}\p{N} ]+$/u, "O nome da residência aceita apenas letras, números e espaços");

export const criarResidenciaSchema = z.object({
    name: residenceNameSchema,
});

//RN-012 -> o código chega normalizado (sem espaços nas pontas e em maiúsculas),
//então aqui basta validar o formato definido na RN-004.
export const residenceCodeSchema = z.string()
    .length(6, "O código da residência tem 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "Código inválido");

export const entrarResidenciaSchema = z.object({
    code: residenceCodeSchema,
});
