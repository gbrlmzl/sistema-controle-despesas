import { notFound } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { buscarResidenciaDoMembro } from "@/lib/residence";
import { listarSolicitacoesPendentes, listarConvitesEnviados } from "@/lib/access";

import PainelResidencia from "./PainelResidencia";


export default async function Residencia({ params }) {
    const { code } = await params;

    const session = await auth();
    if (!session) {
        notFound(); //O layout de /app já exige sessão, mas esta rota expõe dados de uma residência e refaz a verificação
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

    //RN-010 -> Quem não é membro recebe o mesmo resultado de um código inexistente,
    //para que não seja possível descobrir residências existentes testando URLs.
    const residenciaCompleta = await buscarResidenciaDoMembro(code, usuario.id);

    if (!residenciaCompleta) {
        notFound();
    }

    //O id fica no servidor: a residência é identificada pelo código na interface (RN-009)
    const { id: residenciaId, ...residencia } = residenciaCompleta;

    //Só o owner enxerga e responde pendências (RN-017 e RN-042)
    const [solicitacoes, convites] = residencia.isOwner
        ? await Promise.all([
            listarSolicitacoesPendentes(residenciaId),
            listarConvitesEnviados(residenciaId),
        ])
        : [[], []];

    return (
        <div className="primaryCard">
            <PainelResidencia
                residencia={residencia}
                solicitacoes={solicitacoes}
                convites={convites} />
        </div>
    )


}
