import { notFound } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { buscarResidenciaDoMembro } from "@/lib/residence";
import { competenciaAberta, competenciasDaResidencia, listarDespesasDaCompetencia, ultimoFechamento } from "@/lib/expenses";

import ConsultaDespesas from "./ConsultaDespesas";

type PageProps = {
    params: Promise<{ code: string }>;
    searchParams: Promise<{ mes?: string; ano?: string }>;
};

export default async function Despesas({ params, searchParams }: PageProps) {
    const { code } = await params;
    const { mes, ano } = await searchParams;

    const session = await auth();
    if (!session?.user.email) {
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

    //O seletor mostra a grade de todos os meses do ano, então basta saber quais
    //competências têm movimento para destacá-las
    const competencias = await competenciasDaResidencia(residenciaId);

    //Q-2 -> a competência aberta vem pré-selecionada
    const month = Number(mes) || aberta.month;
    const year = Number(ano) || aberta.year;

    const [resumo, fechamentoMaisRecente] = await Promise.all([
        listarDespesasDaCompetencia(residenciaId, month, year),
        ultimoFechamento(residenciaId),
    ]);

    //Só o fechamento mais recente pode ser desfeito, para não abrir buracos na sequência
    const podeReabrir = Boolean(
        fechamentoMaisRecente &&
        fechamentoMaisRecente.month === month &&
        fechamentoMaisRecente.year === year
    );

    return (
        <div className="primaryCard">
            <ConsultaDespesas
                residencia={residencia}
                usuarioId={usuario.id}
                competencias={competencias}
                competencia={{ month: month, year: year }}
                resumo={resumo}
                isCompetenciaAberta={month === aberta.month && year === aberta.year}
                podeReabrir={podeReabrir} />
        </div>
    )


}
