'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { criarNotificacao } from "@/lib/notifications";
import type { ActionState } from "@/types/actions";



export default async function responderSolicitacaoAction(code: string, requestId: number, aceitar: boolean): Promise<ActionState> {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está respondendo
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> RN-017 / CA-5: apenas o owner decide sobre entradas
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode responder solicitações.',
            success: false,
        }
    }

    // 4 -> Q-11: residência arquivada congela a entrada de novos membros
    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada. Desarquive-a para responder solicitações.',
            success: false,
        }
    }

    // 5 -> A solicitação precisa estar pendente e pertencer a esta residência
    const solicitacao = await db.joinRequest.findFirst({
        where: {
            id: requestId,
            residenceId: contexto.residencia.id,
            status: 'PENDING',
        },
        select: {
            id: true,
            requesterId: true,
            requester: { select: { name: true } },
        },
    });

    if (!solicitacao) {
        return {
            message: 'Esta solicitação não está mais disponível',
            success: false,
        }
    }

    try {
        if (!aceitar) {
            // 6 -> CA-3: recusar não cria vínculo. O respondedAt registrado aqui é o que
            //alimenta a espera de uma hora antes de uma nova tentativa (RN-013).
            await db.joinRequest.update({
                where: { id: solicitacao.id },
                data: { status: 'DECLINED', respondedAt: new Date() },
            })

            //CA-4 -> o solicitante é notificado da decisão
            await criarNotificacao({
                userId: solicitacao.requesterId,
                type: 'JOIN_REQUEST_DECLINED',
                title: 'Solicitação recusada',
                message: `Sua solicitação para entrar na residência "${contexto.residencia.name}" foi recusada.`,
                linkTo: '/app/residences',
            })

            revalidatePath(`/app/residences/${contexto.residencia.code}`);

            return {
                success: true,
                message: `Solicitação de ${solicitacao.requester.name} recusada.`,
            }
        }

        // 7 -> CA-2: aceitar cria o vínculo e dá baixa na solicitação, na mesma transação
        await db.$transaction([
            db.membership.create({
                data: {
                    userId: solicitacao.requesterId,
                    residenceId: contexto.residencia.id,
                    role: 'MEMBER',
                },
            }),
            db.joinRequest.update({
                where: { id: solicitacao.id },
                data: { status: 'ACCEPTED', respondedAt: new Date() },
            }),
        ])

        await criarNotificacao({
            userId: solicitacao.requesterId,
            type: 'JOIN_REQUEST_ACCEPTED',
            title: 'Solicitação aceita',
            message: `Você agora faz parte da residência "${contexto.residencia.name}".`,
            linkTo: `/app/residences/${contexto.residencia.code}`,
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}`);

        return {
            success: true,
            message: `${solicitacao.requester.name} agora é membro da residência.`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao responder a solicitação. Tente novamente mais tarde.',
            success: false,
        }
    }


}
