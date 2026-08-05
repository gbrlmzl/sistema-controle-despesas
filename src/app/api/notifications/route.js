import db from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listarNotificacoes, contarNaoLidas, marcarComoLidas, marcarTodasComoLidas } from "@/lib/notifications";


//Resolve o usuário autenticado. Retorna null quando não há sessão ou o usuário não existe.
async function usuarioDaSessao() {
    const session = await auth();
    if (!session) {
        return null;
    }

    return db.user.findUnique({
        select: { id: true },
        where: { email: session.user.email },
    });
}


export async function GET(req) {
    const usuario = await usuarioDaSessao();
    if (!usuario) {
        return NextResponse.json({ success: false, data: null, message: "Usuário não autenticado" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const pagina = Number(searchParams.get("pagina")) || 1;
        const limite = Number(searchParams.get("limite")) || undefined;

        //RN-034 -> a consulta é sempre filtrada pelo usuário da sessão
        const [resultado, naoLidas] = await Promise.all([
            listarNotificacoes(usuario.id, { pagina: pagina, limite: limite }),
            contarNaoLidas(usuario.id),
        ]);

        return NextResponse.json(
            { success: true, data: { ...resultado, naoLidas: naoLidas }, message: 'Notificações buscadas com sucesso!' },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro ao buscar notificações" }, { status: 500 });
    }

}


//Marca notificações como lidas: uma lista específica (painel do sino) ou todas (tela dedicada).
export async function PATCH(req) {
    const usuario = await usuarioDaSessao();
    if (!usuario) {
        return NextResponse.json({ success: false, message: "Usuário não autenticado" }, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
    } catch (error) {
        return NextResponse.json({ success: false, message: "JSON inválido" }, { status: 400 });
    }

    try {
        if (body.todas === true) {
            await marcarTodasComoLidas(usuario.id);
        } else {
            //O filtro por userId dentro do helper impede marcar notificação de outro usuário
            await marcarComoLidas(usuario.id, body.ids);
        }

        const naoLidas = await contarNaoLidas(usuario.id);

        return NextResponse.json(
            { success: true, data: { naoLidas: naoLidas }, message: 'Notificações atualizadas!' },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro ao atualizar notificações" }, { status: 500 });
    }

}
