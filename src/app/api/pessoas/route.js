import db from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pessoasPayloadSchema } from "@/schemas/pessoas";



export async function POST(req) {
    //1 -> Verifica se o usuário está autenticado, se não estiver, retorna erro 401 - não autorizado
    const session = await auth();
    if (!session) {
        return NextResponse.json({ success: false, message: "Usuário não autenticado" }, { status: 401 });
    }
    
    //2 -> Verifica o corpo da requisição
    let body;
    try {
        body = await req.json();
        if (!body.listaPessoasACadastrar) {
            throw new Error();
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: "JSON inválido" }, { status: 400 });
    }
    //3 -> Valida os dados recebidos usando o schema do Zod
    const parseResult = pessoasPayloadSchema.safeParse(body.listaPessoasACadastrar);
    if (!parseResult.success) {
        return NextResponse.json({ success: false, message: "Dados inválidos" }, { status: 400 });
    }

    const payload = parseResult.data;

    //4 -> Consulta o usuário no banco de dados
    const usuario = await db.user.findUnique({
        where: {
            email: session.user.email,
        },
    });

    if (!usuario) {
        return NextResponse.json({ success: false, message: 'Erro de autenticação' }, { status: 401 });
    }

    try {
        for (const pessoa of payload) {
            //5 -> Se os dados forem válidos, cadastra a pessoa no banco de dados
            await db.pessoa.create({
                data: {
                    name: pessoa.nome,
                    email: pessoa.email,
                    idUsuario: usuario.id //Associa a pessoa ao usuário autenticado
                },
            });
        }


    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro ao cadastrar pessoas" }, { status: 500 });

    }

    return NextResponse.json({ success: true, message: 'Pessoas cadastradas com sucesso!' }, { status: 201 });

}







export async function GET() {
    const session = await auth()
    if (!session) {
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

        const pessoas = await db.person.findMany({
            where: {
                userId: usuario.id
            }
        })

        return NextResponse.json({ success: true, data: pessoas, message: 'Pessoas buscadas com sucesso!' }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Erro ao buscar pessoas" }, { status: 500 });
    }



}

