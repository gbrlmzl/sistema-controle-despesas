'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario, gerarCodigoDisponivel } from "@/lib/residence";
import type { ActionState } from "@/types/actions";



export default async function regenerarCodigoAction(code: string): Promise<ActionState<{ code: string }>> {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está regenerando
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> RN-045 / CA-8: apenas o owner regenera o código
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode gerar um novo código.',
            success: false,
        }
    }

    // 4 -> CA-9: residência arquivada é somente leitura
    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada. Desarquive-a para gerar um novo código.',
            success: false,
        }
    }

    // 5 -> RN-046: o código é gerado pelo sistema, com tratamento de colisão
    const novoCodigo = await gerarCodigoDisponivel();

    if (!novoCodigo) {
        return {
            message: 'Não foi possível gerar um novo código. Tente novamente.',
            success: false,
        }
    }

    // 6 -> RN-048: as solicitações pendentes nasceram do código antigo. Se o motivo de
    //regenerar é um vazamento, mantê-las contradiz a intenção da ação — então caem junto.
    //RN-047: os membros atuais não são tocados.
    try {
        await db.$transaction([
            db.residence.update({
                where: { id: contexto.residencia.id },
                data: { code: novoCodigo },
            }),
            db.joinRequest.updateMany({
                where: { residenceId: contexto.residencia.id, status: 'PENDING' },
                data: { status: 'CANCELLED', respondedAt: new Date() },
            }),
        ])

        revalidatePath('/app/residences');

        //A rota é identificada pelo código (RN-009), então quem chamou precisa
        //redirecionar para a nova URL — a antiga deixou de existir.
        return {
            success: true,
            message: 'Novo código gerado!',
            data: { code: novoCodigo },
        }

    }
    catch (error) {
        return {
            message: 'Erro ao gerar um novo código. Tente novamente mais tarde.',
            success: false,
        }
    }


}
