import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/prisma";
import { buscarResidenciaDoMembro } from "@/lib/residence";
import { competenciaAberta } from "@/lib/expenses";
import type { ParamsResidencia } from "@/types/routes";

import CadastrarDespesaForm from "./CadastrarDespesaForm";


export default async function CadastrarDespesa({ params }: ParamsResidencia) {
    const { code } = await params;

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

    //RN-018 / RN-010 -> quem não é membro recebe o mesmo resultado de código inexistente
    const residenciaCompleta = await buscarResidenciaDoMembro(code, usuario.id);

    if (!residenciaCompleta) {
        notFound();
    }

    const { id: residenciaId, ...residencia } = residenciaCompleta;

    //Residência arquivada é somente leitura: não há o que cadastrar aqui
    if (residencia.isArchived) {
        redirect(`/app/residences/${residencia.code}/expenses`);
    }

    const competencia = await competenciaAberta(residenciaId);

    return (
        <div className="primaryCard">
            <CadastrarDespesaForm residencia={residencia} competencia={competencia} />
        </div>
    )


}
