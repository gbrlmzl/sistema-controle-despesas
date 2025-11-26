'use server'
import { auth } from "../../../../../auth";
import db from "../../../../../lib/prisma";
import { hash, compare } from "bcrypt";

export default async function settingsAction(_prevState, formData) {
    const entries = Array.from(formData.entries()); //Converte os dados do formulário em um array de pares
    const data = Object.fromEntries(entries); //Transforma o array de pares em um objeto, onde cada campo do formulário vira uma propriedade do objeto.
    const saltRounds = 10;

    if (!data.currentPassword || !data.newPassword || !data.confirmNewPassword) {
        return {
            message: 'Não pode haver campos vazios',
            success: false,
        }
    }

    if(data.newPassword.length < 8) {
        return {
            message: 'A nova senha deve ter pelo menos 8 caracteres',
            success: false,
        }
    }

    if (!/[\d\W]/.test(data.newPassword)) {
        return {
            message: 'A nova senha deve conter ao menos um número ou símbolo',
            success: false,
        }
    }

    if (data.newPassword !== data.confirmNewPassword) {
        return {
            message: 'As novas senhas não coincidem',
            success: false,
        }
    }


    //Busca o usuário no banco de dados e verifica a senha atual
    try{
        const session = await auth();
        if (!session) {
            return {
                message: 'Usuário não autenticado',
                success: false,
            }
        }
        const usuario = await db.usuario.findUnique({
            where: {
                email: session.user.email,
            }
        });

        if (!usuario) {
            return {
                message: 'Usuário não encontrado',
                success: false,
            }
        }

        const passwordMatch = await compare(data.currentPassword, usuario.password);
        if (!passwordMatch) {
            return {
                message: 'Senha atual incorreta',
                success: false,
            }
        }
        
        const newHashedPassword = await hash(data.newPassword, saltRounds);
        
        await db.usuario.update({
            where: {
                email: session.user.email,
            },
            data: {
                password: newHashedPassword,
            }
        });

        return {
            message: 'Senha atualizada com sucesso',
            success: true,
        }
            


    } catch(e){
        console.log(e);
        console.log(e.message);  
        return {
            message: 'Erro na operação. Tente novamente mais tarde.',
            success: false,
        }
    }

}