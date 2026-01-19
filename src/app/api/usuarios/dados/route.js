import db from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";



export async function DELETE(req) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ success: false, message: "Usuário não autenticado", data: { gastosDeletados: 0, pessoasDeletadas: 0 } }, { status: 401 });
    }//Se não tiver sessão, retorna erro 401 - não autorizado


    let body;
    try {
        body = await req.json();
        if (!body.textoConfirmacao) {
            throw new Error("JSON inválido");
        }
        else if (body.textoConfirmacao !== "FORMATAR SISTEMA") {
            return NextResponse.json({ success: false, message: "Texto de confirmação incorreto", data: { gastosDeletados: 0, pessoasDeletadas: 0 } }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }


    try {
        const usuario = await db.usuario.findUnique({
            where: {
                email: session.user.email,
            },
        });
        if (!usuario) {
            return NextResponse.json({ success: false, message: 'Erro de autenticação', data: { gastosDeletados: 0, pessoasDeletadas: 0 } }, { status: 401 });
        }

        const idsPessoasCadastradas = await db.pessoa.findMany({
            select: { id: true },
            where: { idUsuario: usuario.id }
        })
        const idsMapeados = idsPessoasCadastradas.map(pessoa => pessoa.id);

        const gastosDeletados = await db.gasto.deleteMany({
            where: { idPessoa: { in: idsMapeados } }
        })

        const pessoasDeletadas = await db.pessoa.deleteMany({
            where: { id: { in: idsMapeados } }
        })

        return new Response(JSON.stringify({ success: true, message: "Sucesso na formatação", data: { gastosDeletados: gastosDeletados.count, pessoasDeletadas: pessoasDeletadas.count } }), { status: 200 });


    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro ao formatar o sistema", data: { gastosDeletados: 0, pessoasDeletadas: 0 } }, { status: 500 });
    }





}