import db from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export async function GET(req) {
    const session = await auth()
    if (!session) {
        return new Response(JSON.stringify({ success: false, message: "Usuário não autenticado" }), { status: 401 });
    }//Se não tiver sessão, retorna erro 401 - não autorizado

    const { searchParams } = new URL(req.url);
    const mes = parseInt(searchParams.get("mes"));
    const ano = parseInt(searchParams.get("ano"));

    const usuario = await db.usuario.findUnique({
        where: {
            email: session.user.email,
        },
    });

    const gastos = await prisma.gasto.findMany({
        where: {
            pessoa: {
                idUsuario: usuario.id
            },
            month: mes,
            year: ano

        },
        select: {
            name: true,
            value: true,
            idPessoa: true
        }
    });



    return new Response(
        JSON.stringify({ gastos }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );

}