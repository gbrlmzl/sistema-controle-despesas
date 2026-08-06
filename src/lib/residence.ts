import { randomInt } from "node:crypto";
import db from "./prisma";

//RN-004 -> Alfabeto do código sem caracteres ambíguos (O/0 e I/1), porque o código
//é lido e digitado manualmente por outro usuário.
const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TAMANHO_CODIGO = 6;
const MAX_TENTATIVAS_CODIGO = 10;

//RN-012 -> O código é comparado sem diferenciar maiúsculas de minúsculas e
//ignorando espaços nas pontas, para tolerar erro de digitação e colagem.
export function normalizeResidenceCode(code: unknown): string {
    if (typeof code !== "string") {
        return "";
    }
    return code.trim().toUpperCase();
}

function gerarCodigo(): string {
    let codigo = "";
    for (let i = 0; i < TAMANHO_CODIGO; i++) {
        codigo += ALFABETO_CODIGO[randomInt(ALFABETO_CODIGO.length)];
    }
    return codigo;
}

//Gera um código ainda não usado por nenhuma residência.
//Retorna null se não encontrar um código livre dentro do limite de tentativas.
export async function gerarCodigoDisponivel(): Promise<string | null> {
    for (let tentativa = 0; tentativa < MAX_TENTATIVAS_CODIGO; tentativa++) {
        const codigo = gerarCodigo();

        const residenciaExistente = await db.residence.findUnique({
            select: { id: true },
            where: { code: codigo },
        });

        if (!residenciaExistente) {
            return codigo;
        }
    }

    return null;
}

//RN-007 -> Lista apenas as residências das quais o usuário é membro.
//Q-7 -> A flag isArchived permite separar as arquivadas em uma seção própria,
//em vez de escondê-las (o que passaria a impressão de que os dados sumiram).
export async function listarResidenciasDoUsuario(userId: number) {
    const vinculos = await db.membership.findMany({
        where: { userId: userId },
        orderBy: { joinedAt: "asc" },
        select: {
            role: true,
            residence: {
                select: {
                    name: true,
                    code: true,
                    archivedAt: true,
                    owner: { select: { name: true } },
                },
            },
        },
    });

    return vinculos.map(vinculo => ({
        name: vinculo.residence.name,
        code: vinculo.residence.code,
        ownerName: vinculo.residence.owner.name,
        isOwner: vinculo.role === "OWNER",
        isArchived: vinculo.residence.archivedAt !== null,
    }));
}

//RN-009 / RN-010 -> Busca a residência pelo código, mas só a devolve se o usuário
//for membro. Um não-membro recebe null, o mesmo resultado de um código inexistente,
//para que não seja possível descobrir códigos válidos testando URLs.
export async function buscarResidenciaDoMembro(code: string, userId: number) {
    const codigoNormalizado = normalizeResidenceCode(code);

    if (!codigoNormalizado) {
        return null;
    }

    const residencia = await db.residence.findUnique({
        where: { code: codigoNormalizado },
        select: {
            id: true,
            name: true,
            code: true,
            ownerId: true,
            archivedAt: true,
            owner: { select: { name: true } },
            members: {
                orderBy: { joinedAt: "asc" },
                select: {
                    role: true,
                    user: { select: { id: true, name: true, username: true } },
                },
            },
        },
    });

    if (!residencia) {
        return null;
    }

    const vinculoDoUsuario = residencia.members.find(membro => membro.user.id === userId);

    if (!vinculoDoUsuario) {
        return null;
    }

    return {
        id: residencia.id,
        name: residencia.name,
        code: residencia.code,
        ownerName: residencia.owner.name,
        isOwner: vinculoDoUsuario.role === "OWNER",
        isArchived: residencia.archivedAt !== null,
        //O owner aparece primeiro na lista de membros, por ser quem administra a residência
        members: residencia.members
            .map(membro => ({
                userId: membro.user.id,
                name: membro.user.name,
                username: membro.user.username,
                isOwner: membro.role === "OWNER",
                isCurrentUser: membro.user.id === userId,
            }))
            .sort((a, b) => Number(b.isOwner) - Number(a.isOwner)),
    };
}

//Carrega o vínculo do usuário autenticado com a residência informada.
//Retorna null nos três casos em que qualquer ação deve ser negada:
//residência inexistente, usuário inexistente ou usuário que não é membro.
export async function carregarVinculoDoUsuario(code: string, email: string | null | undefined) {
    const codigoNormalizado = normalizeResidenceCode(code);

    if (!codigoNormalizado || !email) {
        return null;
    }

    const residencia = await db.residence.findUnique({
        where: { code: codigoNormalizado },
        select: { id: true, name: true, code: true, ownerId: true, archivedAt: true },
    });

    if (!residencia) {
        return null;
    }

    const usuario = await db.user.findUnique({
        select: { id: true },
        where: { email: email },
    });

    if (!usuario) {
        return null;
    }

    const vinculo = await db.membership.findUnique({
        select: { id: true, role: true },
        where: {
            userId_residenceId: {
                userId: usuario.id,
                residenceId: residencia.id,
            },
        },
    });

    if (!vinculo) {
        return null;
    }

    return {
        usuario: usuario,
        residencia: residencia,
        vinculo: vinculo,
        isOwner: vinculo.role === "OWNER",
        isArchived: residencia.archivedAt !== null,
    };
}
