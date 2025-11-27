import db from "../../../lib/prisma";
import { auth } from "../../../auth";
import { NextResponse } from 'next/server';
import { gastosPayloadSchema } from "@/schemas/gastos";

export async function GET(req) {
    const session = await auth()
    if (!session) {
        return new NextResponse.json({ success: false, message: 'Usuário não autenticado' }, { status: 401 });
    }//Se não tiver sessão, retorna erro 401 - não autorizado

    const usuario = await db.usuario.findUnique({
        where: {
            email: session.user.email,
        },
    });

    const { searchParams } = new URL(req.url);
    const mes = searchParams.get("mes")
    const ano = searchParams.get("ano");


    let gastos;

    if (mes && ano) {
        const mesInt = parseInt(mes);
        const anoInt = parseInt(ano);
        gastos = await prisma.gasto.findMany({
            where: {
                pessoa: {
                    idUsuario: usuario.id
                },
                month: mesInt,
                year: anoInt

            },
            select: {
                name: true,
                value: true,
                idPessoa: true
            }
        });
    } else {
        //buscar todos os gastos
        gastos = await prisma.gasto.findMany({
            where: {
                pessoa: {
                    idUsuario: usuario.id
                }
            },
            select: {
                name: true,
                value: true,
                month: true,
                year: true,
                idPessoa: true
            }
        })

    }

    return new Response(
        JSON.stringify({ gastos }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );

}



export async function POST(req) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ success: false, message: "Usuário não autenticado" }, { status: 401 });
    }
    //Se não estiver autenticado, retorna erro 401 - não autorizado

    let body;
    try {
        body = await req.json();
    } catch (error) {
        return NextResponse.json({ success: false, message: 'JSON inválido' }, { status: 400 });
    }

    const parseResult = gastosPayloadSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ success: false, message: 'Dados inválidos' }, { status: 400 });
    }

    const payload = parseResult.data;


    const listaDespesasDeCadaPessoa = payload.lista;
    const despesaMes = payload.mes;
    const despesaAno = payload.ano;
    

    const usuario = await db.usuario.findUnique({
        where: {
            email: session.user.email,
        },
    });

    if (!usuario) {
        return NextResponse.json({ success: false, message: 'Erro de autenticação' }, { status: 401 });
    }

    try {
        //Verifica se existe despesas cadastradas para o mês e ano informados, exclui e cadastra as novas despesas
        const listaIdPessoasObj = await db.pessoa.findMany({
            select: {
                id: true
            },
            where: {
                idUsuario: usuario.id
            }
        })
        const idsPessoasArray = listaIdPessoasObj.map(pessoa => pessoa.id);
        await db.gasto.deleteMany({
            where: {
                month: despesaMes,
                year: despesaAno,
                idPessoa: { in: idsPessoasArray }
            }
        })

        //Cadastrar as novas despesas
        for (const pessoa of listaDespesasDeCadaPessoa) {
            if (pessoa.despesas.length > 0) {
                const idPessoa = pessoa.idPessoa;
                for (const despesa of pessoa.despesas) {
                    await db.gasto.create({
                        data: {
                            name: despesa.identificacao,
                            value: despesa.valor,
                            month: despesaMes,
                            year: despesaAno,
                            idPessoa: idPessoa
                        }
                    })
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Despesas cadastradas com sucesso!' }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Erro ao cadastrar despesas, tente novamente mais tarde.' }, { status: 500 });
    }








}