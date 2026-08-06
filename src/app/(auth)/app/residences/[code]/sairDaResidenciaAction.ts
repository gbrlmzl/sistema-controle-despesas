'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { competenciaAberta } from "@/lib/expenses";
import type { ActionState } from "@/types/actions";



export default async function sairDaResidenciaAction(code: string): Promise<ActionState> {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo do usuário com a residência.
    //Quem não é membro recebe a mesma resposta de código inexistente (RN-010).
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> RN-021: o owner não pode sair sem antes transferir a propriedade,
    //senão a residência ficaria sem dono e a RN-017 seria quebrada.
    if (contexto.isOwner) {
        return {
            message: 'Transfira a propriedade da residência antes de sair dela.',
            success: false,
        }
    }

    // 4 -> RN-022: quem sai leva junto os lançamentos da competência ainda aberta —
    //ao sair, está abrindo mão de receber por eles. Os meses já fechados permanecem
    //intactos, porque aquelas contas já foram acertadas.
    const competencia = await competenciaAberta(contexto.residencia.id);

    try {
        await db.$transaction([
            db.expense.updateMany({
                where: {
                    residenceId: contexto.residencia.id,
                    createdById: contexto.usuario.id,
                    month: competencia.month,
                    year: competencia.year,
                    deletedAt: null,
                },
                data: { deletedAt: new Date() },
            }),
            db.membership.delete({
                where: { id: contexto.vinculo.id },
            }),
        ])

        revalidatePath('/app/residences');

        return {
            success: true,
            message: 'Você saiu da residência.',
        }

    }
    catch (error) {
        return {
            message: 'Erro ao sair da residência. Tente novamente mais tarde.',
            success: false,
        }
    }


}
