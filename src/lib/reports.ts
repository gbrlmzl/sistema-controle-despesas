import db from "./prisma";
import { competenciaSeguinte, type Competencia } from "./expenses";
import { ExpenseCategory } from "@/generated/client";

//RN-062 -> o gráfico de evolução mostra as últimas 6 competências
export const COMPETENCIAS_NA_EVOLUCAO = 6;
//RN-068 -> a média usa as 3 competências anteriores, sinalizando desvio a partir de 30%,
//e exige ao menos 2 meses de histórico para não alarmar com base num único mês.
export const COMPETENCIAS_NA_MEDIA = 3;
export const LIMITE_DESVIO = 0.3;
export const MINIMO_COMPETENCIAS_PARA_MEDIA = 2;


function filtroBase(residenceId: number, month: number, year: number, userId: number | null) {
    return {
        residenceId: residenceId,
        month: month,
        year: year,
        deletedAt: null as null, //RN-057: lançamentos excluídos ficam de fora do relatório
        ...(userId ? { createdById: userId } : {}),
    };
}

export function competenciaAnterior({ month, year }: Competencia): Competencia {
    return month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year: year };
}

//FEAT-026 -> quebra por categoria de uma competência.
//Passar userId restringe ao relatório pessoal (RN-060: sempre dentro da residência atual).
export async function relatorioPorCategoria(residenceId: number, month: number, year: number, userId: number | null = null) {
    const agrupado = await db.expense.groupBy({
        by: ["category"],
        where: filtroBase(residenceId, month, year, userId),
        _sum: { valueInCents: true },
        _count: { _all: true },
    });

    const totalInCents = agrupado.reduce((soma, item) => soma + (item._sum.valueInCents ?? 0), 0);

    //CA-4 -> categorias sem lançamento simplesmente não aparecem, porque o groupBy
    //só devolve o que existe. CA-3 -> da que mais gastou para a que menos gastou.
    const categorias = agrupado
        .map(item => ({
            category: item.category,
            totalInCents: item._sum.valueInCents ?? 0,
            quantidade: item._count._all,
            //RN-058 -> o percentual é sobre o total da competência exibida
            percentual: totalInCents > 0 ? ((item._sum.valueInCents ?? 0) / totalInCents) * 100 : 0,
        }))
        .sort((a, b) => b.totalInCents - a.totalInCents);

    return { categorias: categorias, totalInCents: totalInCents };
}

//FEAT-027 -> variação entre duas competências, no total e por categoria.
export async function compararCompetencias(residenceId: number, atual: Competencia, anterior: Competencia, userId: number | null = null) {
    const [relatorioAtual, relatorioAnterior] = await Promise.all([
        relatorioPorCategoria(residenceId, atual.month, atual.year, userId),
        relatorioPorCategoria(residenceId, anterior.month, anterior.year, userId),
    ]);

    const mapaAnterior = new Map(relatorioAnterior.categorias.map(item => [item.category, item.totalInCents]));
    const categoriasVistas = new Set([
        ...relatorioAtual.categorias.map(item => item.category),
        ...relatorioAnterior.categorias.map(item => item.category),
    ]);

    const categorias = [...categoriasVistas].map(category => {
        const valorAtual = relatorioAtual.categorias.find(item => item.category === category)?.totalInCents ?? 0;
        const valorAnterior = mapaAnterior.get(category) ?? 0;

        return {
            category: category,
            atualInCents: valorAtual,
            anteriorInCents: valorAnterior,
            variacaoInCents: valorAtual - valorAnterior,
            //RN-061 -> sem base de comparação não existe percentual com leitura útil.
            //A categoria é marcada como nova e o percentual fica nulo.
            isNova: valorAnterior === 0 && valorAtual > 0,
            percentual: valorAnterior > 0 ? ((valorAtual - valorAnterior) / valorAnterior) * 100 : null,
        };
    }).sort((a, b) => Math.abs(b.variacaoInCents) - Math.abs(a.variacaoInCents));

    return {
        totalAtualInCents: relatorioAtual.totalInCents,
        totalAnteriorInCents: relatorioAnterior.totalInCents,
        variacaoInCents: relatorioAtual.totalInCents - relatorioAnterior.totalInCents,
        percentual: relatorioAnterior.totalInCents > 0
            ? ((relatorioAtual.totalInCents - relatorioAnterior.totalInCents) / relatorioAnterior.totalInCents) * 100
            : null,
        temBaseDeComparacao: relatorioAnterior.totalInCents > 0,
        categorias: categorias,
    };
}

//FEAT-028 -> série das últimas competências até a selecionada, para o gráfico de evolução.
export async function serieDeEvolucao(residenceId: number, ate: Competencia, quantidade: number = COMPETENCIAS_NA_EVOLUCAO, userId: number | null = null) {
    //Monta a janela andando para trás a partir da competência exibida
    const janela: Competencia[] = [];
    let cursor: Competencia = { month: ate.month, year: ate.year };

    for (let i = 0; i < quantidade; i++) {
        janela.unshift({ ...cursor });
        cursor = competenciaAnterior(cursor);
    }

    const totais = await Promise.all(
        janela.map(async (competencia) => {
            const agregado = await db.expense.aggregate({
                where: filtroBase(residenceId, competencia.month, competencia.year, userId),
                _sum: { valueInCents: true },
            });

            return {
                month: competencia.month,
                year: competencia.year,
                totalInCents: agregado._sum.valueInCents ?? 0,
            };
        })
    );

    return totais;
}

//FEAT-029 -> rateio por divisão igual, como no cálculo da V1.
//RN-065 -> a cota é dividida entre os membros atuais. Quem sai leva junto os
//lançamentos da competência aberta (RN-022), então o total não fica inflado por
//gastos de quem não está mais na casa.
export async function calcularRateio(residenceId: number, month: number, year: number) {
    const [membros, despesas] = await Promise.all([
        db.membership.findMany({
            where: { residenceId: residenceId },
            orderBy: { joinedAt: "asc" },
            select: { userId: true, user: { select: { name: true } } },
        }),
        db.expense.findMany({
            where: filtroBase(residenceId, month, year, null),
            select: { createdById: true, valueInCents: true },
        }),
    ]);

    const totalInCents = despesas.reduce((soma, despesa) => soma + despesa.valueInCents, 0);
    const quantidadeMembros = membros.length;

    if (quantidadeMembros === 0 || totalInCents === 0) {
        return { cotaInCents: 0, totalInCents: totalInCents, participantes: [], temRateio: false };
    }

    //RN-066 -> a divisão em centavos raramente é exata. A sobra é distribuída de um
    //em um centavo entre os primeiros participantes, o que mantém a soma das cotas
    //igual ao total e, por consequência, a soma dos saldos exatamente em zero.
    const cotaBase = Math.floor(totalInCents / quantidadeMembros);
    const sobra = totalInCents - (cotaBase * quantidadeMembros);

    const gastoPorMembro = new Map<number, number>();
    for (const despesa of despesas) {
        gastoPorMembro.set(despesa.createdById, (gastoPorMembro.get(despesa.createdById) ?? 0) + despesa.valueInCents);
    }

    const participantes = membros.map((membro, indice) => {
        const cotaInCents = cotaBase + (indice < sobra ? 1 : 0);
        const gastoInCents = gastoPorMembro.get(membro.userId) ?? 0;
        const saldoInCents = gastoInCents - cotaInCents;

        return {
            userId: membro.userId,
            name: membro.user.name,
            gastoInCents: gastoInCents,
            cotaInCents: cotaInCents,
            saldoInCents: saldoInCents,
            recebe: saldoInCents > 0,
            paga: saldoInCents < 0,
        };
    }).sort((a, b) => b.saldoInCents - a.saldoInCents);

    return {
        cotaInCents: cotaBase,
        totalInCents: totalInCents,
        participantes: participantes,
        temRateio: true,
    };
}

//FEAT-035 -> média das competências anteriores por categoria, para sinalizar desvios.
export async function mediaPorCategoria(residenceId: number, ate: Competencia, userId: number | null = null) {
    const janela: Competencia[] = [];
    let cursor = competenciaAnterior(ate);

    for (let i = 0; i < COMPETENCIAS_NA_MEDIA; i++) {
        janela.push({ ...cursor });
        cursor = competenciaAnterior(cursor);
    }

    const relatorios = await Promise.all(
        janela.map(competencia => relatorioPorCategoria(residenceId, competencia.month, competencia.year, userId))
    );

    //Só entram no cálculo as competências em que a categoria realmente teve lançamento;
    //meses sem movimento puxariam a média para baixo e gerariam alarme falso.
    const acumulado = new Map<ExpenseCategory, { soma: number; meses: number }>();

    for (const relatorio of relatorios) {
        for (const categoria of relatorio.categorias) {
            const atual = acumulado.get(categoria.category) ?? { soma: 0, meses: 0 };
            atual.soma += categoria.totalInCents;
            atual.meses += 1;
            acumulado.set(categoria.category, atual);
        }
    }

    const medias = new Map<ExpenseCategory, { mediaInCents: number; mesesConsiderados: number; confiavel: boolean }>();

    for (const [category, dados] of acumulado) {
        medias.set(category, {
            mediaInCents: Math.round(dados.soma / dados.meses),
            mesesConsiderados: dados.meses,
            //CA-4 -> sem histórico suficiente a categoria não é sinalizada
            confiavel: dados.meses >= MINIMO_COMPETENCIAS_PARA_MEDIA,
        });
    }

    return medias;
}

//Junta a quebra por categoria com a média histórica, marcando os desvios relevantes.
export async function relatorioComDesvios(residenceId: number, competencia: Competencia, userId: number | null = null) {
    const [relatorio, medias] = await Promise.all([
        relatorioPorCategoria(residenceId, competencia.month, competencia.year, userId),
        mediaPorCategoria(residenceId, competencia, userId),
    ]);

    const categorias = relatorio.categorias.map(categoria => {
        const media = medias.get(categoria.category);

        if (!media || !media.confiavel || media.mediaInCents === 0) {
            return { ...categoria, mediaInCents: media?.mediaInCents ?? null, desvio: null as number | null, acimaDaMedia: null as boolean | null };
        }

        const desvio = (categoria.totalInCents - media.mediaInCents) / media.mediaInCents;

        return {
            ...categoria,
            mediaInCents: media.mediaInCents,
            desvio: Math.abs(desvio) >= LIMITE_DESVIO ? desvio : null,
            acimaDaMedia: desvio > 0,
        };
    });

    return { categorias: categorias, totalInCents: relatorio.totalInCents };
}

//FEAT-033 -> linhas da exportação em CSV, já com autor e categoria resolvidos.
export async function despesasParaExportacao(residenceId: number, month: number, year: number, userId: number | null = null) {
    return db.expense.findMany({
        where: filtroBase(residenceId, month, year, userId),
        orderBy: { createdAt: "asc" },
        select: {
            createdAt: true,
            name: true,
            category: true,
            valueInCents: true,
            isRecurring: true,
            createdBy: { select: { name: true } },
        },
    });
}

export { competenciaSeguinte };
