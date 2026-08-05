import db from "./prisma";

//RN-040 -> a tela dedicada pagina a partir de 20 itens
export const NOTIFICACOES_POR_PAGINA = 20;
//RN-035 -> o painel do sino é um alerta, não um histórico
export const NOTIFICACOES_NO_PAINEL = 5;

//RN-037 -> Ponto único de publicação. Qualquer área do sistema cria notificação por aqui,
//já resolvendo o texto e o destino, para que a leitura não precise conhecer as regras de cada tipo.
export async function criarNotificacao({ userId, type, title, message, linkTo }) {
    return db.notification.create({
        data: {
            userId: userId,
            type: type,
            title: title,
            message: message,
            linkTo: linkTo ?? null,
        },
    });
}

//Usada quando o mesmo evento avisa vários destinatários (ex.: fechamento do mês).
export async function criarNotificacoes(notificacoes) {
    if (notificacoes.length === 0) {
        return;
    }

    return db.notification.createMany({
        data: notificacoes.map(notificacao => ({
            userId: notificacao.userId,
            type: notificacao.type,
            title: notificacao.title,
            message: notificacao.message,
            linkTo: notificacao.linkTo ?? null,
        })),
    });
}

//RN-034 -> cada usuário enxerga exclusivamente as próprias notificações
export async function contarNaoLidas(userId) {
    return db.notification.count({
        where: { userId: userId, readAt: null },
    });
}

export async function listarNotificacoes(userId, { limite, pagina } = {}) {
    const tamanho = limite ?? NOTIFICACOES_POR_PAGINA;
    const paginaAtual = pagina ?? 1;

    const [notificacoes, total] = await Promise.all([
        db.notification.findMany({
            where: { userId: userId },
            orderBy: { createdAt: "desc" },
            skip: (paginaAtual - 1) * tamanho,
            take: tamanho,
            select: {
                id: true,
                type: true,
                title: true,
                message: true,
                linkTo: true,
                readAt: true,
                createdAt: true,
            },
        }),
        db.notification.count({ where: { userId: userId } }),
    ]);

    return {
        notificacoes: notificacoes.map(notificacao => ({
            ...notificacao,
            isRead: notificacao.readAt !== null,
        })),
        total: total,
        pagina: paginaAtual,
        totalPaginas: Math.max(1, Math.ceil(total / tamanho)),
    };
}

//RN-036 -> ao abrir o painel do sino, as notificações exibidas passam a contar como lidas
export async function marcarComoLidas(userId, ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
        return;
    }

    return db.notification.updateMany({
        where: { userId: userId, id: { in: ids }, readAt: null },
        data: { readAt: new Date() },
    });
}

export async function marcarTodasComoLidas(userId) {
    return db.notification.updateMany({
        where: { userId: userId, readAt: null },
        data: { readAt: new Date() },
    });
}
