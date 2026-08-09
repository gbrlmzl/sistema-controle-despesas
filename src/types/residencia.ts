import type { buscarResidenciaDoMembro } from "@/lib/residence";
import type { listarSolicitacoesPendentes, listarConvitesEnviados } from "@/lib/access";
import type { atividadeRecente, listarDespesasDaCompetencia, competenciasDaResidencia, listarDespesasRecorrentesDoUsuario } from "@/lib/expenses";

export type ResidenciaComMembros = NonNullable<Awaited<ReturnType<typeof buscarResidenciaDoMembro>>>;
export type MembroResidencia = ResidenciaComMembros["members"][number];
export type Residencia = Omit<ResidenciaComMembros, "id">;

export type SolicitacaoPendente = Awaited<ReturnType<typeof listarSolicitacoesPendentes>>[number];
export type ConviteEnviado = Awaited<ReturnType<typeof listarConvitesEnviados>>[number];

export type AtividadeItem = Awaited<ReturnType<typeof atividadeRecente>>[number];

export interface ResumoCompetencia {
    totalInCents: number;
    quantidade: number;
    isClosed: boolean;
    porMembro: { userId: number; name: string; totalInCents: number }[];
}

export type ResumoDespesas = Awaited<ReturnType<typeof listarDespesasDaCompetencia>>;
export type GrupoDespesas = ResumoDespesas["porMembro"][number];
export type DespesaItem = GrupoDespesas["despesas"][number];
export type CompetenciaComDespesas = Awaited<ReturnType<typeof competenciasDaResidencia>>[number];
export type DespesaRecorrente = Awaited<ReturnType<typeof listarDespesasRecorrentesDoUsuario>>[number];
