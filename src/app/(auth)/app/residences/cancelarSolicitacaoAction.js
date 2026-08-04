'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";



export default async function cancelarSolicitacaoAction(requestId) {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Consulta o usuário no banco de dados
    const usuario = await db.user.findUnique({
        select: { id: true },
        where: { email: session.user.email },
    });

    if (!usuario) {
        return {
            message: 'Erro de autenticação',
            success: false,
        }
    }

    // 3 -> RN-042: o filtro por requesterId garante que ninguém cancela solicitação alheia.
    //RN-043: só enquanto estiver pendente.
    const solicitacao = await db.joinRequest.findFirst({
        where: {
            id: requestId,
            requesterId: usuario.id,
            status: 'PENDING',
        },
        select: {
            id: true,
            residence: { select: { name: true } },
        },
    });

    if (!solicitacao) {
        return {
            message: 'Esta solicitação não está mais pendente',
            success: false,
        }
    }

    try {
        await db.joinRequest.update({
            where: { id: solicitacao.id },
            data: { status: 'CANCELLED', respondedAt: new Date() },
        })

        revalidatePath('/app/residences');

        return {
            success: true,
            message: `Solicitação para "${solicitacao.residence.name}" cancelada.`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao cancelar a solicitação. Tente novamente mais tarde.',
            success: false,
        }
    }


}
