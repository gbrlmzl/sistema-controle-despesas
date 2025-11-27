import * as z from "zod";

export const registerSchema = z.object({
    name: z.string().min(1, "O nome não pode estar vazio").max(100),
    email: z.email('Email inválido'),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres").max(100).refine(p => /[\d\W]/.test(p)),
    confirmPassword: z.string().min(1, 'Confirme a senha'),
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'As senhas não coincidem',
});

