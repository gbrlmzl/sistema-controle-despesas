'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import { normalizeUsername } from "@/lib/username";
import { calcularExpiracaoConvite, expirarConvitesVencidos } from "@/lib/access";
import { criarNotificacao } from "@/lib/notifications";
import type { ActionState } from "@/types/actions";



export default async function convidarUsuarioAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const username = normalizeUsername(data.username);

    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Se não tiver nome de usuário, retorna erro
    if (!username) {
        return {
            message: 'Informe o nome de usuário',
            success: false,
        }
    }

    // 3 -> Carrega o vínculo de quem está convidando
    const contexto = await carregarVinculoDoUsuario(data.code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 4 -> RN-014: apenas o owner convida
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode convidar usuários.',
            success: false,
        }
    }

    // 5 -> Q-11: residência arquivada congela a entrada de novos membros
    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada. Desarquive-a para convidar usuários.',
            success: false,
        }
    }

    // 6 -> CA-4: nome de usuário precisa existir
    const convidado = await db.user.findUnique({
        select: { id: true, name: true },
        where: { username: username },
    });

    if (!convidado) {
        return {
            message: 'Nenhum usuário encontrado com esse nome de usuário',
            success: false,
        }
    }

    // 7 -> CA-5: quem já é membro não é convidado de novo
    const jaEMembro = await db.membership.findUnique({
        select: { id: true },
        where: {
            userId_residenceId: {
                userId: convidado.id,
                residenceId: contexto.residencia.id,
            },
        },
    });

    if (jaEMembro) {
        return {
            message: `${convidado.name} já participa desta residência`,
            success: false,
        }
    }

    // 8 -> CA-6: não cria convite duplicado. Vencidos são expirados antes da checagem,
    //senão um convite antigo impediria o envio de um novo (RN-015).
    await expirarConvitesVencidos();

    const convitePendente = await db.invite.findFirst({
        select: { id: true },
        where: {
            residenceId: contexto.residencia.id,
            invitedUserId: convidado.id,
            status: 'PENDING',
        },
    });

    if (convitePendente) {
        return {
            message: `${convidado.name} já tem um convite pendente para esta residência`,
            success: false,
        }
    }

    // 9 -> Cria o convite e avisa o convidado
    try {
        await db.invite.create({
            data: {
                residenceId: contexto.residencia.id,
                invitedUserId: convidado.id,
                invitedById: contexto.usuario.id,
                expiresAt: calcularExpiracaoConvite(),
            },
        })

        await criarNotificacao({
            userId: convidado.id,
            type: 'INVITE_RECEIVED',
            title: 'Convite para uma residência',
            message: `Você foi convidado para a residência "${contexto.residencia.name}".`,
            linkTo: '/app/residences',
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}`);

        return {
            success: true,
            message: `Convite enviado para ${convidado.name}!`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao enviar o convite. Tente novamente mais tarde.',
            success: false,
        }
    }


}
