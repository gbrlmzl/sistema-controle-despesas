'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";



export default async function arquivarResidenciaAction(code, arquivar) {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está pedindo o arquivamento
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> Q-12 / RN-033: apenas o owner arquiva e desarquiva
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode arquivá-la.',
            success: false,
        }
    }

    // 4 -> Evita gravar um estado que já é o atual
    if (arquivar === contexto.isArchived) {
        return {
            message: arquivar ? 'Esta residência já está arquivada.' : 'Esta residência não está arquivada.',
            success: false,
        }
    }

    // 5 -> Arquivar é reversível (Q-10): guarda a data ao arquivar e limpa ao desarquivar
    try {
        await db.residence.update({
            where: { id: contexto.residencia.id },
            data: { archivedAt: arquivar ? new Date() : null },
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}`);
        revalidatePath('/app/residences');

        return {
            success: true,
            message: arquivar ? 'Residência arquivada.' : 'Residência desarquivada.',
        }

    }
    catch (error) {
        return {
            message: 'Erro ao arquivar a residência. Tente novamente mais tarde.',
            success: false,
        }
    }


}
