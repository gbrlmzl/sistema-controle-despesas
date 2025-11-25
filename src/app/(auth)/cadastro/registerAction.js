'use server'

import db from "../../../../lib/prisma";
import { hash } from "bcrypt";



export default async function registerAction(_prevState, formData) {
    const entries = Array.from(formData.entries()); //Converte os dados do formulário em um array de pares
    const data = Object.fromEntries(entries); //Transforma o array de pares em um objeto, onde cada campo do formulário vira uma propriedade do objeto.
    const saltRounds = 10;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    //Se não tiver email, nome ou senha, retorna erro
    if (!data.email || !data.name || !data.password || !data.confirmPassword) {

        return {
            message: 'Não pode haver campos vazios',
            success: false,
        }
    }

    if (!emailRegex.test(data.email)) {
        return {
            message: 'Email inválido',
            success: false,
        }
    }

    if (data.password.length < 8) {
        return {
            message: 'A senha deve ter pelo menos 8 caracteres',
            success: false,
        }
    }

    if (!/[\d\W]/.test(data.password)) {
        return {
            message: 'A senha deve conter ao menos um número ou símbolo',
            success: false,
        }
    }

    //Se a senha e a confirmação de senha forem diferentes, retorna erro
    if (data.password !== data.confirmPassword) {
        return {
            message: 'As senhas não coincidem',
            success: false,
        }
    }

    //se o usuário existe, retorna erro
    const user = await db.usuario.findUnique({
        where: {
            email: data.email,
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
        const senhaHash = await hash(data.password, saltRounds) //Criptografa a senha do usuário
        await db.usuario.create({
            data: {
                name: data.name,
                email: data.email,
                password: senhaHash, //salva a senha criptografada no banco de dados

            }
        })

        return {
            success: true,
        }

    }
    catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        return {
            message: 'Erro ao cadastrar usuário. Tente novamente mais tarde.',
            success: false,
        }
    }
    
  
}