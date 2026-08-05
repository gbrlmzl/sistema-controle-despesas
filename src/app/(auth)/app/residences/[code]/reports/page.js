import { notFound } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { buscarResidenciaDoMembro } from "@/lib/residence";
import { competenciaAberta, competenciasDaResidencia } from "@/lib/expenses";
import {
    relatorioComDesvios,
    compararCompetencias,
    serieDeEvolucao,
    calcularRateio,
    competenciaAnterior,
    despesasParaExportacao,
} from "@/lib/reports";

import RelatorioResidencia from "./RelatorioResidencia";


export default async function Relatorios({ params, searchParams }) {
    const { code } = await params;
    const { mes, ano, aba } = await searchParams;

    const session = await auth();
    if (!session) {
        notFound();
    }

    const usuario = await db.user.findUnique({
        select: { id: true },
        where: {
            email: session.user.email,
        },
    });

    if (!usuario) {
        notFound();
    }

    //RN-010 -> quem não é membro recebe o mesmo resultado de código inexistente
    const residenciaCompleta = await buscarResidenciaDoMembro(code, usuario.id);

    if (!residenciaCompleta) {
        notFound();
    }

    const { id: residenciaId, ...residencia } = residenciaCompleta;

    const aberta = await competenciaAberta(residenciaId);
    const competencia = {
        month: Number(mes) || aberta.month,
        year: Number(ano) || aberta.year,
    };

    //CA-1 da US-024 -> a tela abre na aba da residência.
    //RN-060 -> a aba pessoal olha só para esta residência, nunca soma as outras.
    const abaAtiva = aba === 'pessoal' ? 'pessoal' : 'residencia';
    const filtroUsuario = abaAtiva === 'pessoal' ? usuario.id : null;

    const [relatorio, comparativo, evolucao, rateio, competencias, totalDaCasa, despesas] = await Promise.all([
        relatorioComDesvios(residenciaId, competencia, filtroUsuario),
        compararCompetencias(residenciaId, competencia, competenciaAnterior(competencia), filtroUsuario),
        serieDeEvolucao(residenciaId, competencia, undefined, filtroUsuario),
        calcularRateio(residenciaId, competencia.month, competencia.year),
        competenciasDaResidencia(residenciaId),
        //CA-4 da US-025 -> o percentual que os gastos do usuário representam do total da casa
        relatorioComDesvios(residenciaId, competencia, null),
        despesasParaExportacao(residenciaId, competencia.month, competencia.year, filtroUsuario),
    ]);

    return (
        <div className="primaryCard">
            <RelatorioResidencia
                residencia={residencia}
                competencia={competencia}
                competencias={competencias}
                abaAtiva={abaAtiva}
                relatorio={relatorio}
                comparativo={comparativo}
                evolucao={evolucao}
                rateio={rateio}
                totalDaCasaInCents={totalDaCasa.totalInCents}
                despesas={despesas.map(despesa => ({
                    createdAt: despesa.createdAt,
                    name: despesa.name,
                    category: despesa.category,
                    valueInCents: despesa.valueInCents,
                    autor: despesa.createdBy.name,
                }))} />
        </div>
    )


}
