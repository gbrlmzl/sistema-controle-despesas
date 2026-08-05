import { notFound } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { buscarResidenciaDoMembro } from "@/lib/residence";

import ConfiguracoesResidencia from "./ConfiguracoesResidencia";


export default async function ConfiguracoesDaResidencia({ params, searchParams }) {
    const { code } = await params;
    const { convidar } = await searchParams;

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

    //RN-010 -> quem não é membro recebe o mesmo resultado de um código inexistente
    const residenciaCompleta = await buscarResidenciaDoMembro(code, usuario.id);

    if (!residenciaCompleta) {
        notFound();
    }

    const { id: _residenciaId, ...residencia } = residenciaCompleta;

    //Qualquer membro entra aqui: o owner encontra a administração completa e o
    //membro comum encontra ver membros e sair da residência. Quem decide o que
    //aparece é o próprio componente, a partir do papel.

    return (
        <div className="primaryCard">
            <ConfiguracoesResidencia
                residencia={residencia}
                abrirConviteInicial={convidar === '1' && !residencia.isArchived} />
        </div>
    )


}
