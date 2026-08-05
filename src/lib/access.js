import db from "./prisma";

//RN-015 -> convite expira em 7 dias
export const DIAS_EXPIRACAO_CONVITE = 7;
//RN-013 -> uma solicitação recusada só pode ser refeita depois de uma hora
export const HORAS_ESPERA_APOS_RECUSA = 1;


export function calcularExpiracaoConvite() {
    const expiracao = new Date();
    expiracao.setDate(expiracao.getDate() + DIAS_EXPIRACAO_CONVITE);
    return expiracao;
}

//A expiração é aplicada na leitura, e não por rotina agendada: o sistema não tem
//agendador, e um convite vencido só precisa parar de valer quando alguém for olhá-lo.
export async function expirarConvitesVencidos() {
    await db.invite.updateMany({
        where: {
            status: 'PENDING',
            expiresAt: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
    });
}

//Convites pendentes recebidos pelo usuário (US-008)
export async function listarConvitesRecebidos(userId) {
    await expirarConvitesVencidos();

    const convites = await db.invite.findMany({
        where: { invitedUserId: userId, status: 'PENDING' },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            createdAt: true,
            residence: { select: { name: true, code: true } },
            invitedBy: { select: { name: true } },
        },
    });

    return convites.map(convite => ({
        id: convite.id,
        residenceName: convite.residence.name,
        residenceCode: convite.residence.code,
        invitedByName: convite.invitedBy.name,
        createdAt: convite.createdAt,
    }));
}

//Convites pendentes enviados por uma residência (US-022, CA-1)
export async function listarConvitesEnviados(residenceId) {
    await expirarConvitesVencidos();

    const convites = await db.invite.findMany({
        where: { residenceId: residenceId, status: 'PENDING' },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            createdAt: true,
            invitedUser: { select: { name: true, username: true } },
        },
    });

    return convites.map(convite => ({
        id: convite.id,
        invitedUserName: convite.invitedUser.name,
        invitedUserUsername: convite.invitedUser.username,
        createdAt: convite.createdAt,
    }));
}

//Solicitações pendentes recebidas por uma residência (US-009, CA-1)
export async function listarSolicitacoesPendentes(residenceId) {
    const solicitacoes = await db.joinRequest.findMany({
        where: { residenceId: residenceId, status: 'PENDING' },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            createdAt: true,
            requester: { select: { name: true, username: true } },
        },
    });

    return solicitacoes.map(solicitacao => ({
        id: solicitacao.id,
        requesterName: solicitacao.requester.name,
        requesterUsername: solicitacao.requester.username,
        createdAt: solicitacao.createdAt,
    }));
}

//Solicitações pendentes enviadas pelo usuário (US-022, CA-3)
export async function listarSolicitacoesEnviadas(userId) {
    const solicitacoes = await db.joinRequest.findMany({
        where: { requesterId: userId, status: 'PENDING' },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            createdAt: true,
            residence: { select: { name: true, code: true } },
        },
    });

    return solicitacoes.map(solicitacao => ({
        id: solicitacao.id,
        residenceName: solicitacao.residence.name,
        residenceCode: solicitacao.residence.code,
        createdAt: solicitacao.createdAt,
    }));
}

//RN-013 -> devolve a data em que o usuário poderá solicitar entrada novamente,
//ou null quando não há recusa recente bloqueando uma nova tentativa.
export async function bloqueioPorRecusaRecente(residenceId, userId) {
    const limite = new Date(Date.now() - HORAS_ESPERA_APOS_RECUSA * 60 * 60 * 1000);

    const recusaRecente = await db.joinRequest.findFirst({
        where: {
            residenceId: residenceId,
            requesterId: userId,
            status: 'DECLINED',
            respondedAt: { gte: limite },
        },
        orderBy: { respondedAt: "desc" },
        select: { respondedAt: true },
    });

    if (!recusaRecente) {
        return null;
    }

    return new Date(recusaRecente.respondedAt.getTime() + HORAS_ESPERA_APOS_RECUSA * 60 * 60 * 1000);
}
