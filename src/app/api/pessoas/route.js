import db from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "../../../auth";

//Gere a estrutura de um metodo POST
export async function POST(req) {

    const session = await auth(); //Pega a sessão do usuário logado
    if (!session) {
        return new Response(JSON.stringify({ success: false, message: "Usuário não autenticado" }), { status: 401 });
    }//Se não tiver sessão, retorna erro 401 - não autorizado

    const emailRegex = /\S+@\S+\.\S+/;
    const listaPessoasObj = await req.json(); //Pega o corpo da requisição e transforma em JSON
    const listaPessoas = listaPessoasObj.listaPessoasACadastrar; //Pega a lista de pessoas do JSON

    //Encontra o usuário correspondente no banco de dados
    const usuario = await db.usuario.findUnique({
        where: {
            email: session.user.email,
        },
    });

    for (const pessoa of listaPessoas) {
        if (!pessoa.nome || !pessoa.email) { //Verifica se o nome e email existem
            return new Response(JSON.stringify({ success: false, message: "Nome e email são obrigatórios para cada pessoa" }), { status: 400 });
        } else if (!emailRegex.test(pessoa.email)) { //Verifica se o email é válido
            return new Response(JSON.stringify({ success: false, message: `Email inválido para a pessoa ${pessoa.nome}` }), { status: 400 });
        }
        //Se os dados forem válidos, cadastra a pessoa no banco de dados
        await db.pessoa.create({
            data: {
                name: pessoa.nome,
                email: pessoa.email,
                idUsuario: usuario.id //Associa a pessoa ao usuário logado
            },
        });
    }

    //Ocorrendo tudo certo no cadastro das pessoas no banco de dados, retorna uma resposta positiva
    return new Response(
        JSON.stringify({ success: true, message: "Pessoas cadastradas com sucesso" }),
        { status: 201, headers: { "Content-Type": "application/json" } }
    );
}

export async function GET() {
    const session = await auth()
    if (!session) {
        return new Response(JSON.stringify({ success: false, message: "Usuário não autenticado" }), { status: 401 });
    }//Se não tiver sessão, retorna erro 401 - não autorizado

    const usuario = await db.usuario.findUnique({
        where: {
            email: session.user.email,
        },
    });

    const pessoas = await db.pessoa.findMany({
        where: {
            idUsuario: usuario.id
        }
    })



    return new Response(
        JSON.stringify({pessoas}),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );

}

