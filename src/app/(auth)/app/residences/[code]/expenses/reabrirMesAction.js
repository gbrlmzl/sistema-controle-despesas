'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { ultimoFechamento } from "@/lib/expenses";
import { competenciaTexto } from "@/utils/categorias";



export default async function reabrirMesAction(code) {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está reabrindo
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> Reabrir é do owner, assim como fechar
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode reabrir um mês.',
            success: false,
        }
    }

    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada. Desarquive-a para reabrir um mês.',
            success: false,
        }
    }

    // 4 -> Só o fechamento mais recente pode ser desfeito. Reabrir um mês do meio
    //deixaria buracos na sequência de meses fechados, que é o que dá sentido à
    //ideia de "conta acertada até tal mês".
    const fechamento = await ultimoFechamento(contexto.residencia.id);

    if (!fechamento) {
        return {
            message: 'Não há nenhum mês fechado nesta residência.',
            success: false,
        }
    }

    try {
        await db.monthClosure.delete({
            where: { id: fechamento.id },
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}/expenses`);

        return {
            success: true,
            message: `Mês de ${competenciaTexto(fechamento.month, fechamento.year)} reaberto.`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao reabrir o mês. Tente novamente mais tarde.',
            success: false,
        }
    }


}
