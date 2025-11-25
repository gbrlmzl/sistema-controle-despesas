'use server'

import db from  "../../../../lib/prisma";
import { hash } from "bcrypt";



export default async function registerAction(_prevState, formData) {
    const entries = Array.from(formData.entries()); //Converte os dados do formulário em um array de pares
    const data = Object.fromEntries(entries); //Transforma o array de pares em um objeto, onde cada campo do formulário vira uma propriedade do objeto.
    const saltRounds = 10;


    //Se não tiver email, nome ou senha, retorna erro
    if (!data.email || !data.name || !data.password || !data.confirmPassword) {
        
        return {
            message: 'Preencha todos os campos',
            success : false,
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
        where:{
            email : data.email,        
        }
    });

    if (user) {
        return {
            message : 'Este usuário já existe',
            success : false,
        }
    }
    



    //se não existir, cria o usuário
    const senhaHash = await hash(data.password, saltRounds) //Criptografa a senha do usuário

    await db.usuario.create({
        data:{
            name : data.name,
            email: data.email,
            password: senhaHash, //salva a senha criptografada no banco de dados

        }
    })

    return {
        success : true,
    }    
}