import { notFound } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { buscarResidenciaDoMembro } from "@/lib/residence";

import GerenciarMembros from "./GerenciarMembros";


export default async function Membros({ params }) {
    const { code } = await params;

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

    //RN-010 -> quem não é membro recebe o mesmo resultado de código inexistente.
    //Qualquer membro pode ver quem mora na casa; só o owner enxerga as ações de gestão.
    const residenciaCompleta = await buscarResidenciaDoMembro(code, usuario.id);

    if (!residenciaCompleta) {
        notFound();
    }

    const { id: _residenciaId, ...residencia } = residenciaCompleta;

    return (
        <div className="primaryCard">
            <GerenciarMembros residencia={residencia} />
        </div>
    )


}
