'use server'

import db from "@/lib/prisma";
import { hash } from "bcrypt";
import { registerSchema } from "@/schemas/usuarios";
import { normalizeUsername, usernameEmUso } from "@/lib/username";
import type { ActionState } from "@/types/actions";



export default async function registerAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    const saltRounds = 10;

    //O nome de usuário é sempre normalizado (sem espaços nas pontas e em minúsculas)
    //antes da validação, para que "Gabriel" e "gabriel " sejam o mesmo identificador.
    data.username = normalizeUsername(data.username);


    // 1 -> Se não tiver email, nome, nome de usuário ou senha, retorna erro
    if (!data.email || !data.name || !data.username || !data.password || !data.confirmPassword) {

        return {
            message: 'Não pode haver campos vazios',
            success: false,
        }
    }

    // 2 -> Valida os dados do formulário usando o schema do Zod
    const parseResult = registerSchema.safeParse(data);
    if (!parseResult.success) {
        const firstError = parseResult.error.issues[0];
        return {
            message: firstError.message,
            success: false,
        }
    }

    //3 -> O formato dos dados está válido, extrai os dados validados
    const payload = parseResult.data;


    //4 -> Consulta o usuário no banco de dados para verificar se já existe um usuário com o email informado
    const usuario = await db.user.findUnique({
        where: {
            email: payload.email,
        }
    });


    // -> Se existir usuário com esse email, retorna erro
    if (usuario) {
        return {
            message: 'Este usuário já existe!',
            success: false,
        }
    }

    //5 -> Verifica se o nome de usuário já está em uso por outra conta
    if (await usernameEmUso(payload.username)) {
        return {
            message: 'Este nome de usuário já está em uso!',
            success: false,
        }
    }


    //6 -> Após a validação dos dados e a verificação de que não existe usuário cadastrado com esse email, cadastra o novo usuário
    try {
        const senhaHash = await hash(payload.password, saltRounds) // 7-> Criptografa a senha do usuário
        const novoUsuario = await db.user.create({
            data: {
                name: payload.name,
                username: payload.username,
                email: payload.email,
                password: senhaHash, //salva a senha criptografada no banco de dados
                profilePic: null,


            }
        })
        await db.userAuthProvider.create({
            data: {
                userId: novoUsuario.id,
                provider: 'local',
                providerId: payload.email,
            }
        })

        // 8 -> Retorna sucesso após cadastrar o usuário
        return {
            success: true,
            message: 'Usuário cadastrado com sucesso!',
        }

    }
    catch (error) {
        // 9 -> Retorna erro caso ocorra algum problema ao cadastrar o usuário
        return {
            message: 'Erro ao cadastrar usuário. Tente novamente mais tarde.',
            success: false,
        }
    }


}
