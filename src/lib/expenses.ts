import db from "./prisma";
import { ExpenseCategory } from "@/generated/client";

export interface Competencia {
    month: number;
    year: number;
}

//Limite de segurança ao procurar a competência aberta, para nunca iterar sem fim
const MAX_MESES_A_PROCURAR = 36;


export async function mesEstaFechado(residenceId: number, month: number, year: number): Promise<boolean> {
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
export async function competenciaAberta(residenceId: number): Promise<Competencia> {
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

export function competenciaSeguinte({ month, year }: Competencia): Competencia {
    return month === 12 ? { month: 1, year: year + 1 } : { month: month + 1, year: year };
}

//Q-1 a Q-4 -> todos os membros veem todas as despesas da competência, agrupadas por
//autor, com total por membro e total geral.
export async function listarDespesasDaCompetencia(residenceId: number, month: number, year: number) {
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

    interface GrupoMembro {
        userId: number;
        name: string;
        totalInCents: number;
        despesas: {
            id: string;
            name: string;
            valueInCents: number;
            category: ExpenseCategory;
            isRecurring: boolean;
            createdById: number;
        }[];
    }

    const porMembro: GrupoMembro[] = [];

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
export async function gerarRecorrentes(residenceId: number, origem: Competencia, destino: Competencia): Promise<number> {
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

//Despesas recorrentes do próprio usuário na competência aberta — é o que a tela
//dedicada de gerenciamento (FEAT-025) lista, edita e para de repetir.
export async function listarDespesasRecorrentesDoUsuario(residenceId: number, userId: number, month: number, year: number) {
    return db.expense.findMany({
        where: {
            residenceId: residenceId,
            createdById: userId,
            month: month,
            year: year,
            isRecurring: true,
            deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            valueInCents: true,
            category: true,
            isRecurring: true,
        },
    });
}

//P-2 do painel -> últimos lançamentos da residência, com autor e momento.
//Cobre apenas despesas: entradas e saídas de membros não deixam rastro consultável
//hoje, o que só a trilha de auditoria (FEAT-031) resolveria.
export async function atividadeRecente(residenceId: number, limite: number = 5) {
    const despesas = await db.expense.findMany({
        where: { residenceId: residenceId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: limite,
        select: {
            id: true,
            name: true,
            valueInCents: true,
            category: true,
            month: true,
            year: true,
            createdAt: true,
            createdBy: { select: { name: true } },
        },
    });

    return despesas.map(despesa => ({
        id: despesa.id,
        name: despesa.name,
        valueInCents: despesa.valueInCents,
        category: despesa.category,
        //A competência aparece na lista porque um lançamento recente pode pertencer
        //a um mês diferente do atual — sem ela, "há 2 dias" fica ambíguo
        month: despesa.month,
        year: despesa.year,
        createdAt: despesa.createdAt,
        autor: despesa.createdBy.name,
    }));
}

//Devolve a competência mais recente já fechada, usada para restringir a reabertura.
export async function ultimoFechamento(residenceId: number) {
    return db.monthClosure.findFirst({
        where: { residenceId: residenceId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        select: { id: true, month: true, year: true },
    });
}

//Competências com movimento, usadas pelo seletor da consulta.
//temDespesas distingue o mês que realmente tem lançamentos daquele que só foi fechado,
//porque é essa diferença que o seletor destaca ou acinzenta.
export async function competenciasDaResidencia(residenceId: number) {
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

    const chave = (competencia: Competencia) => `${competencia.year}-${competencia.month}`;
    const mapa = new Map<string, Competencia & { temDespesas: boolean }>();

    for (const competencia of fechadas) {
        mapa.set(chave(competencia), { ...competencia, temDespesas: false });
    }

    for (const competencia of comDespesas) {
        mapa.set(chave(competencia), { ...competencia, temDespesas: true });
    }

    return [...mapa.values()].sort((a, b) => (b.year - a.year) || (b.month - a.month));
}
