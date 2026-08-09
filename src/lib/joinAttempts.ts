import db from "./prisma";

//RN-049 -> 10 tentativas malsucedidas em 15 minutos bloqueiam por 15 minutos.
//O limite é generoso de propósito: com 6 caracteres em um alfabeto de 32 existem
//cerca de 1,07 bilhão de códigos possíveis, então isto é defesa em profundidade
//e não pode atrapalhar quem apenas errou a digitação.
export const LIMITE_TENTATIVAS = 10;
export const JANELA_MINUTOS = 15;

function inicioDaJanela(): Date {
    return new Date(Date.now() - JANELA_MINUTOS * 60 * 1000);
}

//RN-051 -> a contagem é por usuário autenticado, nunca pela residência alvo (CA-5),
//senão bastaria errar códigos para bloquear a entrada na casa de outra pessoa.
//CA-3 -> o bloqueio expira sozinho: as tentativas antigas simplesmente saem da janela.
export async function usuarioBloqueado(userId: number): Promise<boolean> {
    const tentativas = await db.joinAttempt.count({
        where: {
            userId: userId,
            createdAt: { gte: inicioDaJanela() },
        },
    });

    return tentativas >= LIMITE_TENTATIVAS;
}

export async function registrarTentativaMalsucedida(userId: number): Promise<void> {
    await db.joinAttempt.create({
        data: { userId: userId },
    });
}

//CA-4 -> uma tentativa bem-sucedida zera o contador do usuário.
//Apagar as linhas também evita que a tabela cresça indefinidamente.
export async function limparTentativas(userId: number): Promise<void> {
    await db.joinAttempt.deleteMany({
        where: { userId: userId },
    });
}
