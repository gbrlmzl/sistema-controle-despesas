'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { criarNotificacao } from "@/lib/notifications";



export default async function transferirPropriedadeAction(code, novoOwnerUserId) {
    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Carrega o vínculo de quem está pedindo a transferência
    const contexto = await carregarVinculoDoUsuario(code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 3 -> CA-6: apenas o owner transfere a propriedade
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode transferir a propriedade.',
            success: false,
        }
    }

    // 4 -> RN-032: residência arquivada é somente leitura
    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada. Desarquive-a para transferir a propriedade.',
            success: false,
        }
    }

    // 5 -> Transferir para si mesmo não muda nada
    if (novoOwnerUserId === contexto.usuario.id) {
        return {
            message: 'Você já é o criador desta residência.',
            success: false,
        }
    }

    // 6 -> RN-027: o destino precisa ser um membro ativo da residência
    const vinculoDoNovoOwner = await db.membership.findUnique({
        select: { id: true },
        where: {
            userId_residenceId: {
                userId: novoOwnerUserId,
                residenceId: contexto.residencia.id,
            },
        },
    });

    if (!vinculoDoNovoOwner) {
        return {
            message: 'Só é possível transferir a propriedade para um membro da residência.',
            success: false,
        }
    }

    // 7 -> As três alterações acontecem na mesma transação para que a residência
    //nunca fique com zero ou dois owners (RN-017 e CA-5).
    try {
        await db.$transaction([
            db.residence.update({
                where: { id: contexto.residencia.id },
                data: { ownerId: novoOwnerUserId },
            }),
            db.membership.update({
                where: { id: vinculoDoNovoOwner.id },
                data: { role: 'OWNER' },
            }),
            db.membership.update({
                where: { id: contexto.vinculo.id },
                data: { role: 'MEMBER' },
            }),
        ])

        //CA-7 -> o novo owner é notificado
        await criarNotificacao({
            userId: novoOwnerUserId,
            type: 'OWNERSHIP_TRANSFERRED',
            title: 'Você agora administra uma residência',
            message: `Você passou a ser o criador da residência "${contexto.residencia.name}".`,
            linkTo: `/app/residences/${contexto.residencia.code}`,
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}`);
        revalidatePath('/app/residences');

        return {
            success: true,
            message: 'Propriedade da residência transferida.',
        }

    }
    catch (error) {
        return {
            message: 'Erro ao transferir a propriedade. Tente novamente mais tarde.',
            success: false,
        }
    }


}
