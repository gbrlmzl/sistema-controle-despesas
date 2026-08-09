'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { mesEstaFechado } from "@/lib/expenses";
import type { ActionState } from "@/types/actions";



//"Excluir" nesta tela não remove o lançamento do mês atual, só impede que ele seja
//recopiado no fechamento seguinte (FEAT-025) — a despesa continua valendo e
//aparece normalmente em Consultar Despesas para quem quiser editá-la ou excluí-la.
export default async function pararRecorrenciaAction(code: string, expenseId: string): Promise<ActionState> {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está pedindo a alteração
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

    // 3 -> só o autor altera a própria despesa
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
            message: 'Você só pode alterar as despesas que você mesmo lançou.',
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

    try {
        await db.expense.update({
            where: { id: despesa.id },
            data: { isRecurring: false },
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}/expenses/recurring`);
        revalidatePath(`/app/residences/${contexto.residencia.code}/expenses`);

        return {
            success: true,
            message: `"${despesa.name}" não será mais repetida automaticamente.`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao atualizar a despesa. Tente novamente mais tarde.',
            success: false,
        }
    }


}
