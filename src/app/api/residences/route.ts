import db from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listarResidenciasDoUsuario } from "@/lib/residence";
import { listarConvitesRecebidos, listarSolicitacoesEnviadas } from "@/lib/access";


export async function GET() {
    const session = await auth()
    if (!session?.user.email) {
        return NextResponse.json({ success: false, data: null, message: "Usuário não autenticado" }, { status: 401 });
    }
    //Se não tiver sessão, retorna erro 401 - não autorizado

    try {
        const usuario = await db.user.findUnique({
            select: { id: true },
            where: {
                email: session.user.email,
            },
        });

        if (!usuario) {
            return NextResponse.json({ success: false, data: null, message: 'Erro de autenticação' }, { status: 401 });
        }

        //Além das residências (RN-007), a tela também mostra as pendências de acesso do
        //usuário: convites que ele recebeu (US-008) e solicitações que ele enviou (US-022).
        const [residencias, convitesRecebidos, solicitacoesEnviadas] = await Promise.all([
            listarResidenciasDoUsuario(usuario.id),
            listarConvitesRecebidos(usuario.id),
            listarSolicitacoesEnviadas(usuario.id),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: {
                    residencias: residencias,
                    convitesRecebidos: convitesRecebidos,
                    solicitacoesEnviadas: solicitacoesEnviadas,
                },
                message: 'Residências buscadas com sucesso!'
            },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro ao buscar residências" }, { status: 500 });
    }

}
