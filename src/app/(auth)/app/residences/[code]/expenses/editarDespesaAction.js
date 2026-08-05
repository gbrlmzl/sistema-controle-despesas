'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { mesEstaFechado } from "@/lib/expenses";
import { despesaSchema } from "@/schemas/despesas";
import { parseValorParaCentavos } from "@/utils/dinheiro";



export default async function editarDespesaAction(_prevState, formData) {
    const entries = Array.from(formData.entries()); //Converte os dados do formulário em um array de pares
    const data = Object.fromEntries(entries); //Transforma o array de pares em um objeto, onde cada campo do formulário vira uma propriedade do objeto.

    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está editando
    const contexto = await carregarVinculoDoUsuario(data.code, session.user.email);

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

    // 3 -> Q-5: só o autor edita a própria despesa. O filtro por createdById é o que
    //garante isso mesmo se alguém chamar a action com o id de um lançamento alheio.
    const despesa = await db.expense.findFirst({
        where: {
            id: data.expenseId,
            residenceId: contexto.residencia.id,
            createdById: contexto.usuario.id,
            deletedAt: null,
        },
        select: { id: true, month: true, year: true },
    });

    if (!despesa) {
        return {
            message: 'Você só pode editar as despesas que você mesmo lançou.',
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

    // 5 -> Valida os novos dados
    const valueInCents = parseValorParaCentavos(data.value);

    if (valueInCents === null) {
        return {
            message: 'Informe um valor válido, como 180,50',
            success: false,
        }
    }

    const parseResult = despesaSchema.safeParse({
        name: data.name,
        valueInCents: valueInCents,
        category: data.category,
        isRecurring: data.isRecurring === 'on',
    });

    if (!parseResult.success) {
        const firstError = parseResult.error.issues[0];
        return {
            message: firstError.message,
            success: false,
        }
    }

    const payload = parseResult.data;

    // 6 -> A competência não muda: editar corrige o lançamento, não o move de mês
    try {
        await db.expense.update({
            where: { id: despesa.id },
            data: {
                name: payload.name,
                valueInCents: payload.valueInCents,
                category: payload.category,
                isRecurring: payload.isRecurring,
            },
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}/expenses`);

        return {
            success: true,
            message: 'Despesa atualizada!',
        }

    }
    catch (error) {
        return {
            message: 'Erro ao atualizar a despesa. Tente novamente mais tarde.',
            success: false,
        }
    }


}
