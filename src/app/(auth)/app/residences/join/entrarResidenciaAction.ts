'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { entrarResidenciaSchema } from "@/schemas/residencias";
import { normalizeResidenceCode } from "@/lib/residence";
import { bloqueioPorRecusaRecente, HORAS_ESPERA_APOS_RECUSA } from "@/lib/access";
import { usuarioBloqueado, registrarTentativaMalsucedida, limparTentativas } from "@/lib/joinAttempts";
import { criarNotificacao } from "@/lib/notifications";
import type { ActionState } from "@/types/actions";

//RN-050 -> a resposta a um código que não leva a lugar nenhum é sempre a mesma,
//exista a residência ou não. É o que impede descobrir residências testando códigos.
const MENSAGEM_NAO_ENCONTRADA = 'Nenhuma residência foi encontrada com esse código';


export default async function entrarResidenciaAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    //RN-012 -> tolera espaços nas pontas e diferença de maiúsculas/minúsculas
    data.code = normalizeResidenceCode(data.code);

    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session?.user.email) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Se não tiver código, retorna erro
    if (!data.code) {
        return {
            message: 'Informe o código da residência',
            success: false,
        }
    }

    // 3 -> Valida o formato do código
    const parseResult = entrarResidenciaSchema.safeParse(data);
    if (!parseResult.success) {
        return {
            message: MENSAGEM_NAO_ENCONTRADA,
            success: false,
        }
    }

    const payload = parseResult.data;

    // 4 -> Consulta o usuário no banco de dados
    const usuario = await db.user.findUnique({
        select: { id: true, name: true, username: true },
        where: { email: session.user.email },
    });

    if (!usuario) {
        return {
            message: 'Erro de autenticação',
            success: false,
        }
    }

    // 5 -> FEAT-020: bloqueia antes de consultar, para que o bloqueio não dependa
    //do resultado da busca e não vire um canal de informação sobre códigos válidos.
    if (await usuarioBloqueado(usuario.id)) {
        return {
            message: 'Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.',
            success: false,
        }
    }

    // 6 -> Busca a residência pelo código
    const residencia = await db.residence.findUnique({
        where: { code: payload.code },
        select: {
            id: true,
            name: true,
            code: true,
            ownerId: true,
            archivedAt: true,
            members: { where: { userId: usuario.id }, select: { id: true } },
        },
    });

    //Q-11 -> residência arquivada congela a entrada de novos membros. A resposta é a
    //mesma de código inexistente, e a tentativa também é contabilizada, para que os
    //dois casos sejam indistinguíveis de fora (RN-050).
    if (!residencia || residencia.archivedAt !== null) {
        await registrarTentativaMalsucedida(usuario.id);
        return {
            message: MENSAGEM_NAO_ENCONTRADA,
            success: false,
        }
    }

    // 7 -> CA-5: já é membro. Não conta como tentativa malsucedida, já que o usuário
    //conhece a residência de qualquer forma e não há nada a revelar.
    if (residencia.members.length > 0) {
        return {
            message: 'Você já participa desta residência',
            success: false,
        }
    }

    // 8 -> CA-6: não cria solicitação duplicada
    const solicitacaoPendente = await db.joinRequest.findFirst({
        select: { id: true },
        where: { residenceId: residencia.id, requesterId: usuario.id, status: 'PENDING' },
    });

    if (solicitacaoPendente) {
        return {
            message: 'Sua solicitação já foi enviada e está aguardando resposta',
            success: false,
        }
    }

    // 9 -> RN-013: uma recusa recente impede nova tentativa por uma hora
    const liberadoEm = await bloqueioPorRecusaRecente(residencia.id, usuario.id);
    if (liberadoEm) {
        return {
            message: `Sua solicitação foi recusada recentemente. Você poderá tentar novamente em até ${HORAS_ESPERA_APOS_RECUSA} hora.`,
            success: false,
        }
    }

    // 10 -> Cria a solicitação e avisa o owner
    try {
        await db.joinRequest.create({
            data: {
                residenceId: residencia.id,
                requesterId: usuario.id,
            },
        })

        await criarNotificacao({
            userId: residencia.ownerId,
            type: 'JOIN_REQUEST_RECEIVED',
            title: 'Nova solicitação de entrada',
            message: `${usuario.name} pediu para entrar na residência "${residencia.name}".`,
            linkTo: `/app/residences/${residencia.code}`,
        })

        //CA-4 da US-023 -> uma tentativa bem-sucedida zera o contador
        await limparTentativas(usuario.id);

        return {
            success: true,
            message: `Solicitação enviada! Aguarde a resposta do criador da residência "${residencia.name}".`,
        }

    }
    catch (error) {
        return {
            message: 'Erro ao enviar a solicitação. Tente novamente mais tarde.',
            success: false,
        }
    }


}
