import db from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../../auth";


export async function DELETE() {
    const session = await auth()
    if (!session) {
        return new Response(JSON.stringify({ success: false, message: "Usuário não autenticado", data: {gastosDeletados: 0, pessoasDeletadas : 0} }), { status: 401 });
    }//Se não tiver sessão, retorna erro 401 - não autorizado

    const usuario = await db.usuario.findUnique({
        where: {
            email: session.user.email,
        },
    });

    const idsPessoasCadastradas = await db.pessoa.findMany({
        select : {id: true},
        where : {idUsuario : usuario.id}
    })
    const idsMapeados = idsPessoasCadastradas.map(pessoa => pessoa.id);

    const gastosDeletados = await db.gasto.deleteMany({
        where: {idPessoa : {in : idsMapeados}}
    })

    const pessoasDeletadas = await db.pessoa.deleteMany({
        where: {id: {in : idsMapeados}}
    })

    return new Response(JSON.stringify({success: true, message: "Sucesso na formatação", data: {gastosDeletados : gastosDeletados.count, pessoasDeletadas : pessoasDeletadas.count}}), {status: 200});


}