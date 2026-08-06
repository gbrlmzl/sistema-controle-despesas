import type { relatorioComDesvios, compararCompetencias, serieDeEvolucao, calcularRateio } from "@/lib/reports";
import type { ExpenseCategory } from "@/generated/client";

export type RelatorioComDesvios = Awaited<ReturnType<typeof relatorioComDesvios>>;
export type CategoriaComDesvio = RelatorioComDesvios["categorias"][number];

export type Comparativo = Awaited<ReturnType<typeof compararCompetencias>>;
export type CategoriaComparativo = Comparativo["categorias"][number];

export type Evolucao = Awaited<ReturnType<typeof serieDeEvolucao>>;
export type ItemEvolucao = Evolucao[number];

export type Rateio = Awaited<ReturnType<typeof calcularRateio>>;
export type Participante = Rateio["participantes"][number];

export interface DespesaExportacao {
    createdAt: Date;
    name: string;
    category: ExpenseCategory;
    valueInCents: number;
    autor: string;
}
