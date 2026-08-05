'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { expirarConvitesVencidos } from "@/lib/access";



export default async function responderConviteAction(inviteId, aceitar) {
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

    // 3 -> RN-015: convites vencidos deixam de valer antes de qualquer resposta
    await expirarConvitesVencidos();

    // 4 -> CA-4: só um convite pendente e endereçado a este usuário pode ser respondido.
    //O filtro por invitedUserId também impede responder convite de outra pessoa.
    const convite = await db.invite.findFirst({
        where: {
            id: inviteId,
            invitedUserId: usuario.id,
            status: 'PENDING',
        },
        select: {
            id: true,
            residenceId: true,
            residence: { select: { name: true, code: true, archivedAt: true } },
        },
    });

    if (!convite) {
        return {
            message: 'Este convite não está mais disponível',
            success: false,
        }
    }

    // 5 -> Q-11: residência arquivada não aceita novos membros
    if (aceitar && convite.residence.archivedAt !== null) {
        return {
            message: 'Esta residência foi arquivada e não está aceitando novos membros.',
            success: false,
        }
    }

    try {
        if (!aceitar) {
            // 6 -> CA-3: recusar não cria vínculo nenhum
            await db.invite.update({
                where: { id: convite.id },
                data: { status: 'DECLINED', respondedAt: new Date() },
            })

            revalidatePath('/app/residences');

            return {
                success: true,
                message: 'Convite recusado.',
            }
        }

        // 7 -> RN-016: aceitar dispensa aprovação do owner, que já manifestou a intenção
        //ao convidar. O vínculo e a baixa do convite acontecem na mesma transação.
        await db.$transaction([
            db.membership.create({
                data: {
                    userId: usuario.id,
                    residenceId: convite.residenceId,
                    role: 'MEMBER',
                },
            }),
            db.invite.update({
                where: { id: convite.id },
                data: { status: 'ACCEPTED', respondedAt: new Date() },
            }),
        ])

        revalidatePath('/app/residences');

        return {
            success: true,
            message: `Você entrou na residência "${convite.residence.name}"!`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao responder o convite. Tente novamente mais tarde.',
            success: false,
        }
    }


}
