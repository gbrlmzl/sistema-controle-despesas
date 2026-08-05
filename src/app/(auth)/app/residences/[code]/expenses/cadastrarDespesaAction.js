'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { competenciaAberta } from "@/lib/expenses";
import { despesaSchema } from "@/schemas/despesas";
import { parseValorParaCentavos } from "@/utils/dinheiro";
import { competenciaTexto } from "@/utils/categorias";



export default async function cadastrarDespesaAction(_prevState, formData) {
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

    // 2 -> RN-018: só lança despesa quem é membro da residência
    const contexto = await carregarVinculoDoUsuario(data.code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> Q-9 da US-020: residência arquivada não aceita novas despesas
    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada e não aceita novas despesas.',
            success: false,
        }
    }

    // 4 -> O valor é convertido antes da validação, porque depende do formato digitado
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

    // 5 -> RN-020: a despesa cai sempre na competência aberta, nunca numa escolhida pelo usuário
    const competencia = await competenciaAberta(contexto.residencia.id);

    // 6 -> Cria o lançamento vinculado à residência e ao autor (CA-3)
    try {
        await db.expense.create({
            data: {
                name: payload.name,
                valueInCents: payload.valueInCents,
                category: payload.category,
                month: competencia.month,
                year: competencia.year,
                residenceId: contexto.residencia.id,
                createdById: contexto.usuario.id,
                isRecurring: payload.isRecurring,
            },
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}/expenses`);

        return {
            success: true,
            message: `Despesa lançada em ${competenciaTexto(competencia.month, competencia.year)}!`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao cadastrar a despesa. Tente novamente mais tarde.',
            success: false,
        }
    }


}
