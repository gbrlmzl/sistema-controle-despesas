'use server'

import db from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { criarResidenciaSchema } from "@/schemas/residencias";
import { carregarVinculoDoUsuario } from "@/lib/residence";
import type { ActionState } from "@/types/actions";



export default async function renomearResidenciaAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    // 1 -> Verifica se o usuário está autenticado
    const session = await auth();
    if (!session) {
        return {
            message: 'Usuário não autenticado',
            success: false,
        }
    }

    // 2 -> Se não tiver nome, retorna erro
    if (!data.name) {
        return {
            message: 'Informe o nome da residência',
            success: false,
        }
    }

    // 3 -> CA-3: o novo nome passa pelas mesmas validações da criação (RN-003)
    const parseResult = criarResidenciaSchema.safeParse(data);
    if (!parseResult.success) {
        const firstError = parseResult.error.issues[0];
        return {
            message: firstError.message,
            success: false,
        }
    }

    const payload = parseResult.data;

    // 4 -> Carrega o vínculo de quem está pedindo a renomeação
    const contexto = await carregarVinculoDoUsuario(data.code, session.user.email);

    if (!contexto) {
        return {
            message: 'Residência não encontrada',
            success: false,
        }
    }

    // 5 -> RN-031: apenas o owner renomeia
    if (!contexto.isOwner) {
        return {
            message: 'Apenas o criador da residência pode renomeá-la.',
            success: false,
        }
    }

    // 6 -> RN-032: residência arquivada é somente leitura
    if (contexto.isArchived) {
        return {
            message: 'Esta residência está arquivada. Desarquive-a para renomeá-la.',
            success: false,
        }
    }

    // 7 -> RN-030: só o nome muda; o code permanece o mesmo para não invalidar
    //os códigos que já foram compartilhados.
    try {
        await db.residence.update({
            where: { id: contexto.residencia.id },
            data: { name: payload.name },
        })

        revalidatePath(`/app/residences/${contexto.residencia.code}`);
        revalidatePath('/app/residences');

        return {
            success: true,
            message: 'Nome da residência atualizado!',
        }

    }
    catch (error) {
        return {
            message: 'Erro ao renomear a residência. Tente novamente mais tarde.',
            success: false,
        }
    }


}
