'use server'

import db from "@/lib/prisma";
import { hash } from "bcrypt";
import { registerSchema } from "@/schemas/usuarios";



export default async function registerAction(_prevState, formData) {
    const entries = Array.from(formData.entries()); //Converte os dados do formulário em um array de pares
    const data = Object.fromEntries(entries); //Transforma o array de pares em um objeto, onde cada campo do formulário vira uma propriedade do objeto.
    const saltRounds = 10;
    


    //Se não tiver email, nome ou senha, retorna erro
    if (!data.email || !data.name || !data.password || !data.confirmPassword) {

        return {
            message: 'Não pode haver campos vazios',
            success: false,
        }
    }

    //Valida os dados do formulário usando o schema do Zod
    const parseResult = registerSchema.safeParse(data);
    if (!parseResult.success) {
        const firstError = parseResult.error.issues[0];
        console.log(firstError);
        return {
            message: firstError.message,
            success: false,
        }
    }

    const payload = parseResult.data;


    //se o usuário existe, retorna erro
    const user = await db.usuario.findUnique({
        where: {
            email: payload.email,
        }
    });

    if (user) {
        return {
            message: 'Este usuário já existe!',
            success: false,
        }
    }


    //após a validação dos dados e verificado que não existe usuário cadastrado com esse email, cadastra o novo usuário
    try {
        const senhaHash = await hash(payload.password, saltRounds) //Criptografa a senha do usuário
        await db.usuario.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: senhaHash, //salva a senha criptografada no banco de dados

            }
        })

        return {
            success: true,
            message: 'Usuário cadastrado com sucesso!',
        }

    }
    catch (error) {
        return {
            message: 'Erro ao cadastrar usuário. Tente novamente mais tarde.',
            success: false,
        }
    }
    
  
}