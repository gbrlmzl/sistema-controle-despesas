'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { mesEstaFechado } from "@/lib/expenses";



export default async function excluirDespesaAction(code, expenseId) {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está excluindo
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada e não aceita alterações.',
            success: false,
        }
    }

    // 3 -> Q-5: só o autor exclui a própria despesa
    const despesa = await db.expense.findFirst({
        where: {
            id: expenseId,
            residenceId: contexto.residencia.id,
            createdById: contexto.usuario.id,
            deletedAt: null,
        },
        select: { id: true, name: true, month: true, year: true },
    });

    if (!despesa) {
        return {
            message: 'Você só pode excluir as despesas que você mesmo lançou.',
            success: false,
        }
    }

    // 4 -> Competência fechada fica somente leitura
    if (await mesEstaFechado(contexto.residencia.id, despesa.month, despesa.year)) {
        return {
            message: 'Este mês já foi fechado e não aceita mais alterações.',
            success: false,
        }
    }

    // 5 -> Exclusão lógica: o registro é preservado para auditoria e para não
    //distorcer o histórico já consultado por outros membros.
    try {
        await db.expense.update({
            where: { id: despesa.id },
            data: { deletedAt: new Date() },
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}/expenses`);

        return {
            success: true,
            message: `Despesa "${despesa.name}" excluída.`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao excluir a despesa. Tente novamente mais tarde.',
            success: false,
        }
    }


}
