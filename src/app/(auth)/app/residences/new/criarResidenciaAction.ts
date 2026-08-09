'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { criarResidenciaSchema } from "@/schemas/residencias";
import { gerarCodigoDisponivel } from "@/lib/residence";
import type { ActionState } from "@/types/actions";



export default async function criarResidenciaAction(_prevState: ActionState<{ name: string; code: string }> | null, formData: FormData): Promise<ActionState<{ name: string; code: string }>> {
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session?.user.email) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Se não tiver nome, retorna erro
    if (!data.name) {
        return {
            message: 'Informe o nome da residência',
            success: false,
        }
    }

    // 3 -> Valida os dados do formulário usando o schema do Zod
    const parseResult = criarResidenciaSchema.safeParse(data);
    if (!parseResult.success) {
        const firstError = parseResult.error.issues[0];
        return {
            message: firstError.message,
            success: false,
        }
    }

    //4 -> O formato dos dados está válido, extrai os dados validados
    const payload = parseResult.data;

    //5 -> Consulta o usuário no banco de dados
    const usuario = await db.user.findUnique({
        select: { id: true },
        where: {
            email: session.user.email,
        }
    });

    if (!usuario) {
        return {
            message: 'Erro de autenticação',
            success: false,
        }
    }

    //6 -> Gera o código público da residência
    const codigo = await gerarCodigoDisponivel();

    if (!codigo) {
        return {
            message: 'Não foi possível gerar um código para a residência. Tente novamente.',
            success: false,
        }
    }

    //7 -> Cria a residência junto do vínculo do criador como OWNER.
    //Os dois registros nascem na mesma operação para que nunca exista residência sem dono.
    try {
        const residencia = await db.residence.create({
            data: {
                name: payload.name,
                code: codigo,
                ownerId: usuario.id,
                members: {
                    create: {
                        userId: usuario.id,
                        role: 'OWNER',
                    }
                }
            },
            select: { name: true, code: true },
        })

        // 8 -> Retorna sucesso com os dados exibidos no modal de confirmação
        return {
            success: true,
            message: 'Residência criada com sucesso!',
            data: residencia,
        }

    }
    catch (error) {
        // 9 -> Retorna erro caso ocorra algum problema ao criar a residência
        return {
            message: 'Erro ao criar residência. Tente novamente mais tarde.',
            success: false,
        }
    }


}
