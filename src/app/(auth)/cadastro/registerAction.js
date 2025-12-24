'use server'

import db from "@/lib/prisma";
import { hash } from "bcrypt";
import { registerSchema } from "@/schemas/usuarios";



export default async function registerAction(_prevState, formData) {
    const entries = Array.from(formData.entries()); //Converte os dados do formulário em um array de pares
    const data = Object.fromEntries(entries); //Transforma o array de pares em um objeto, onde cada campo do formulário vira uma propriedade do objeto.
    const saltRounds = 10;
    


    // 1 -> Se não tiver email, nome ou senha, retorna erro
    if (!data.email || !data.name || !data.password || !data.confirmPassword) {   

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


    //5 -> Após a validação dos dados e a verificação de que não existe usuário cadastrado com esse email, cadastra o novo usuário
    try {
        const senhaHash = await hash(payload.password, saltRounds) // 6-> Criptografa a senha do usuário
        await db.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: senhaHash, //salva a senha criptografada no banco de dados
                profilePic: null,


            }
        })
        await db.userAuthProvider.create({
            data: {
                userId: (await db.user.findUnique({ where: { email: payload.email } })).id,
                provider: 'local',
                providerId: payload.email,
            }
        })

        // 7 -> Retorna sucesso após cadastrar o usuário
        return {
            success: true,
            message: 'Usuário cadastrado com sucesso!',
        }

    }
    catch (error) {
        // 8 -> Retorna erro caso ocorra algum problema ao cadastrar o usuário
        return {
            message: 'Erro ao cadastrar usuário. Tente novamente mais tarde.',
            success: false,
        }
    }
    
  
}