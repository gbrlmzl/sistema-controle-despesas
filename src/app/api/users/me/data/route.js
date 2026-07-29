import db from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// "Formatar Sistema": reseta os dados da própria conta (pessoas e gastos).
// Usa soft delete (deletedAt) para preservar o histórico e permitir auditoria posterior.
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
        const usuario = await db.user.findUnique({
            where: {
                email: session.user.email,
            },
        });
        if (!usuario) {
            return NextResponse.json({ success: false, message: 'Erro de autenticação', data: { gastosDeletados: 0, pessoasDeletadas: 0 } }, { status: 401 });
        }

        //Considera apenas os registros ainda ativos (deletedAt === null)
        const idsPessoasCadastradas = await db.person.findMany({
            select: { id: true },
            where: { userId: usuario.id, deletedAt: null }
        })
        const idsMapeados = idsPessoasCadastradas.map(pessoa => pessoa.id);

        const now = new Date();

        //Soft delete dos gastos das pessoas do usuário
        const gastosDeletados = await db.expense.updateMany({
            where: { personId: { in: idsMapeados }, deletedAt: null },
            data: { deletedAt: now }
        })

        //Soft delete das pessoas do usuário
        const pessoasDeletadas = await db.person.updateMany({
            where: { id: { in: idsMapeados }, deletedAt: null },
            data: { deletedAt: now }
        })

        return NextResponse.json({ success: true, message: "Sucesso na formatação", data: { gastosDeletados: gastosDeletados.count, pessoasDeletadas: pessoasDeletadas.count } }, { status: 200 });


    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro ao formatar o sistema", data: { gastosDeletados: 0, pessoasDeletadas: 0 } }, { status: 500 });
    }

}
