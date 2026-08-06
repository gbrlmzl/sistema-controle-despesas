'use server'
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { hash, compare } from "bcrypt";
import type { ActionState } from "@/types/actions";

export default async function settingsAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;
    const saltRounds = 10;

    if (!data.currentPassword || !data.newPassword || !data.confirmNewPassword) {
        return {
            message: 'Não pode haver campos vazios',
            success: false,
        }
    }

    if (data.newPassword.length < 8) {
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
    try {
        const session = await auth();
        if (!session?.user.email) {
            return {
                message: 'Usuário não autenticado',
                success: false,
            }
        }
        const usuario = await db.user.findUnique({
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

        //Contas só-Google não têm senha local — esta tela já fica fora do alcance
        //delas via proxy (src/proxy.ts), isto é só a garantia em nível de tipo.
        if (!usuario.password) {
            return {
                message: 'Esta conta não usa senha local.',
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

        await db.user.update({
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



    } catch (e) {
        return {
            message: 'Erro na operação. Tente novamente mais tarde.',
            success: false,
        }
    }

}
