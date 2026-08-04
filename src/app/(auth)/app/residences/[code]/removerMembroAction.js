'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { criarNotificacao } from "@/lib/notifications";



export default async function removerMembroAction(code, membroUserId) {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está pedindo a remoção
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> RN-024: apenas o owner remove membros
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode remover membros.',
            success: false,
        }
    }

    // 4 -> RN-032: residência arquivada é somente leitura
    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada. Desarquive-a para gerenciar os membros.',
            success: false,
        }
    }

    // 5 -> CA-5: o owner não pode remover a si mesmo (para sair, precisa transferir a propriedade)
    if (membroUserId === contexto.usuario.id) {
        return {
            message: 'Você não pode remover a si mesmo da residência.',
            success: false,
        }
    }

    // 6 -> Confirma que o alvo realmente é membro desta residência
    const vinculoDoMembro = await db.membership.findUnique({
        select: { id: true },
        where: {
            userId_residenceId: {
                userId: membroUserId,
                residenceId: contexto.residencia.id,
            },
        },
    });

    if (!vinculoDoMembro) {
        return {
            message: 'Este usuário não é membro da residência.',
            success: false,
        }
    }

    // 7 -> Remove o vínculo do membro
    try {
        await db.membership.delete({
            where: { id: vinculoDoMembro.id },
        })

        //RN-026 (pendente): as despesas do membro removido seguem a mesma regra da RN-022,
        //que ainda não pode ser aplicada porque Expense não aponta para Residence/User (D-02).

        //CA-7 -> o membro removido é notificado
        await criarNotificacao({
            userId: membroUserId,
            type: 'MEMBER_REMOVED',
            title: 'Você saiu de uma residência',
            message: `Você foi removido da residência "${contexto.residencia.name}".`,
            linkTo: '/app/residences',
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}`);
        revalidatePath('/app/residences');

        return {
            success: true,
            message: 'Membro removido da residência.',
        }

    }
    catch (error) {
        return {
            message: 'Erro ao remover o membro. Tente novamente mais tarde.',
            success: false,
        }
    }


}
