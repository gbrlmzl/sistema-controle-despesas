'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";



export default async function cancelarConviteAction(code, inviteId) {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está cancelando
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> RN-042 / CA-7: apenas o owner cancela os convites que a residência enviou
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode cancelar convites.',
            success: false,
        }
    }

    // 4 -> RN-043: só é possível cancelar enquanto o convite estiver pendente.
    //Aceito ou recusado é desfecho final e não volta atrás.
    const convite = await db.invite.findFirst({
        where: {
            id: inviteId,
            residenceId: contexto.residencia.id,
            status: 'PENDING',
        },
        select: {
            id: true,
            invitedUser: { select: { name: true } },
        },
    });

    if (!convite) {
        return {
            message: 'Este convite não está mais pendente',
            success: false,
        }
    }

    // 5 -> Cancela o convite. RN-044: o destinatário não é notificado — seria ruído
    //sobre algo em que ele nunca chegou a agir; basta a pendência desaparecer.
    try {
        await db.invite.update({
            where: { id: convite.id },
            data: { status: 'CANCELLED', respondedAt: new Date() },
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}`);

        return {
            success: true,
            message: `Convite para ${convite.invitedUser.name} cancelado.`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao cancelar o convite. Tente novamente mais tarde.',
            success: false,
        }
    }


}
