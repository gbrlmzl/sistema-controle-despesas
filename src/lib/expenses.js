import db from "./prisma";

//Limite de segurança ao procurar a competência aberta, para nunca iterar sem fim
const MAX_MESES_A_PROCURAR = 36;


export async function mesEstaFechado(residenceId, month, year) {
    const fechamento = await db.monthClosure.findUnique({
        select: { id: true },
        where: {
            residenceId_year_month: {
                residenceId: residenceId,
                year: year,
                month: month,
            },
        },
    });

    return Boolean(fechamento);
}

//RN-020 -> A competência aberta é o mês corrente do calendário; se o owner já o fechou,
//passa a ser o seguinte. Reabrir um mês passado o destrava para edição, mas não muda
//onde os novos lançamentos caem — eles seguem no mês corrente ou adiante.
export async function competenciaAberta(residenceId) {
    const hoje = new Date();
    let mes = hoje.getMonth() + 1;
    let ano = hoje.getFullYear();

    for (let tentativa = 0; tentativa < MAX_MESES_A_PROCURAR; tentativa++) {
        if (!(await mesEstaFechado(residenceId, mes, ano))) {
            return { month: mes, year: ano };
        }

        mes += 1;
        if (mes > 12) {
            mes = 1;
            ano += 1;
        }
    }

    return { month: mes, year: ano };
}

export function competenciaSeguinte({ month, year }) {
    return month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year: year };
}

//Q-1 a Q-4 -> todos os membros veem todas as despesas da competência, agrupadas por
//autor, com total por membro e total geral.
export async function listarDespesasDaCompetencia(residenceId, month, year) {
    const [despesas, fechamento] = await Promise.all([
        db.expense.findMany({
            where: {
                residenceId: residenceId,
                month: month,
                year: year,
                deletedAt: null, //FEAT-023 usa exclusão lógica
            },
            orderBy: { createdAt: "desc" }, //os lançamentos mais recentes aparecem primeiro
            select: {
                id: true,
                name: true,
                valueInCents: true,
                category: true,
                isRecurring: true,
                createdById: true,
                createdBy: { select: { name: true } },
            },
        }),
        db.monthClosure.findUnique({
            where: {
                residenceId_year_month: { residenceId: residenceId, year: year, month: month },
            },
            select: { closedAt: true, closedBy: { select: { name: true } } },
        }),
    ]);

    const porMembro = [];

    for (const despesa of despesas) {
        let grupo = porMembro.find(item => item.userId === despesa.createdById);

        if (!grupo) {
            grupo = { userId: despesa.createdById, name: despesa.createdBy.name, totalInCents: 0, despesas: [] };
            porMembro.push(grupo);
        }

        grupo.totalInCents += despesa.valueInCents;
        grupo.despesas.push({
            id: despesa.id,
            name: despesa.name,
            valueInCents: despesa.valueInCents,
            category: despesa.category,
            isRecurring: despesa.isRecurring,
            createdById: despesa.createdById,
        });
    }

    //Quem mais gastou aparece primeiro, que é a leitura mais útil da tela
    porMembro.sort((a, b) => b.totalInCents - a.totalInCents);

    return {
        porMembro: porMembro,
        totalInCents: despesas.reduce((soma, despesa) => soma + despesa.valueInCents, 0),
        quantidade: despesas.length,
        isClosed: Boolean(fechamento),
        closedAt: fechamento?.closedAt ?? null,
        closedByName: fechamento?.closedBy?.name ?? null,
    };
}

//FEAT-025 -> ao fechar o mês, as despesas marcadas como recorrentes são recriadas
//na competência seguinte. É o gatilho possível sem agendador no projeto.
export async function gerarRecorrentes(residenceId, origem, destino) {
    const recorrentes = await db.expense.findMany({
        where: {
            residenceId: residenceId,
            month: origem.month,
            year: origem.year,
            isRecurring: true,
            deletedAt: null,
        },
        select: {
            name: true,
            valueInCents: true,
            category: true,
            createdById: true,
        },
    });

    if (recorrentes.length === 0) {
        return 0;
    }

    const resultado = await db.expense.createMany({
        data: recorrentes.map(despesa => ({
            name: despesa.name,
            valueInCents: despesa.valueInCents,
            category: despesa.category,
            month: destino.month,
            year: destino.year,
            residenceId: residenceId,
            createdById: despesa.createdById,
            isRecurring: true, //segue recorrente para se repetir também no mês seguinte
        })),
    });

    return resultado.count;
}

//Devolve a competência mais recente já fechada, usada para restringir a reabertura.
export async function ultimoFechamento(residenceId) {
    return db.monthClosure.findFirst({
        where: { residenceId: residenceId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        select: { id: true, month: true, year: true },
    });
}

//Competências com movimento, usadas pelo seletor da consulta.
//temDespesas distingue o mês que realmente tem lançamentos daquele que só foi fechado,
//porque é essa diferença que o seletor destaca ou acinzenta.
export async function competenciasDaResidencia(residenceId) {
    const [comDespesas, fechadas] = await Promise.all([
        db.expense.findMany({
            where: { residenceId: residenceId, deletedAt: null },
            distinct: ["year", "month"],
            orderBy: [{ year: "desc" }, { month: "desc" }],
            select: { month: true, year: true },
        }),
        db.monthClosure.findMany({
            where: { residenceId: residenceId },
            orderBy: [{ year: "desc" }, { month: "desc" }],
            select: { month: true, year: true },
        }),
    ]);

    const chave = (competencia) => `${competencia.year}-${competencia.month}`;
    const mapa = new Map();

    for (const competencia of fechadas) {
        mapa.set(chave(competencia), { ...competencia, temDespesas: false });
    }

    for (const competencia of comDespesas) {
        mapa.set(chave(competencia), { ...competencia, temDespesas: true });
    }

    return [...mapa.values()].sort((a, b) => (b.year - a.year) || (b.month - a.month));
}
