'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { competenciaAberta, competenciaSeguinte, gerarRecorrentes } from "@/lib/expenses";
import { criarNotificacoes } from "@/lib/notifications";
import { competenciaTexto } from "@/utils/categorias";
import type { ActionState } from "@/types/actions";



export default async function fecharMesAction(code: string): Promise<ActionState> {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está fechando
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> Fechar a conta do mês é decisão do owner, como as demais ações de gestão
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode fechar o mês.',
            success: false,
        }
    }

    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada. Desarquive-a para fechar o mês.',
            success: false,
        }
    }

    // 4 -> Só a competência aberta pode ser fechada; fechar salta para a seguinte
    const competencia = await competenciaAberta(contexto.residencia.id);
    const proxima = competenciaSeguinte(competencia);

    try {
        await db.monthClosure.create({
            data: {
                residenceId: contexto.residencia.id,
                month: competencia.month,
                year: competencia.year,
                closedById: contexto.usuario.id,
            },
        })

        // 5 -> FEAT-025: as recorrentes do mês fechado renascem na competência seguinte
        const recorrentesGeradas = await gerarRecorrentes(contexto.residencia.id, competencia, proxima);

        // 6 -> MONTH_CLOSED: todos os membros são avisados de que a conta foi fechada
        const membros = await db.membership.findMany({
            where: { residenceId: contexto.residencia.id },
            select: { userId: true },
        });

        await criarNotificacoes(membros.map(membro => ({
            userId: membro.userId,
            type: 'MONTH_CLOSED',
            title: 'Conta do mês fechada',
            message: `A conta de ${competenciaTexto(competencia.month, competencia.year)} da residência "${contexto.residencia.name}" foi fechada.`,
            linkTo: `/app/residences/${contexto.residencia.code}/expenses?mes=${competencia.month}&ano=${competencia.year}`,
        })))

        revalidatePath(`/app/residences/${contexto.residencia.code}/expenses`);

        const complemento = recorrentesGeradas > 0
            ? ` ${recorrentesGeradas} despesa(s) recorrente(s) foram lançadas em ${competenciaTexto(proxima.month, proxima.year)}.`
            : '';

        return {
            success: true,
            message: `Mês de ${competenciaTexto(competencia.month, competencia.year)} fechado.${complemento}`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao fechar o mês. Tente novamente mais tarde.',
            success: false,
        }
    }


}
