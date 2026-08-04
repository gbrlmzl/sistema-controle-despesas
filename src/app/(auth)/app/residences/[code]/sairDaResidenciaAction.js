'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";



export default async function sairDaResidenciaAction(code) {
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

    // 4 -> Remove o vínculo do membro com a residência
    try {
        await db.membership.delete({
            where: { id: contexto.vinculo.id },
        })

        //RN-022 (pendente): as despesas do mês em aberto lançadas por quem saiu devem ser
        //apagadas, e as dos meses já fechados devem permanecer. Ainda não é possível aplicar
        //aqui porque Expense não aponta para Residence/User (ver dependência D-02 / EP-04).

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
