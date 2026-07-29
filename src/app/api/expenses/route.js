import db from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { gastosPayloadSchema } from "@/schemas/gastos";

export async function GET(req) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ success: false, message: 'Usuário não autenticado', data: null }, { status: 401 });
    }//Se não tiver sessão, retorna erro 401 - não autorizado

    const usuario = await db.user.findUnique({
        where: {
            email: session.user.email,
        },
    });

    if (!usuario) {
        return NextResponse.json({ success: false, message: 'Erro de autenticação', data: null }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mes = searchParams.get("mes")
    const ano = searchParams.get("ano");


    let gastos;

    if (mes && ano) {
        const mesInt = parseInt(mes);
        const anoInt = parseInt(ano);
        //Apenas gastos ativos (soft delete) de pessoas ativas
        gastos = await db.expense.findMany({
            where: {
                deletedAt: null,
                person: {
                    userId: usuario.id,
                    deletedAt: null
                },
                month: mesInt,
                year: anoInt

            },
            select: {
                name: true,
                value: true,
                month: true,
                year: true,
                personId: true
            }
        });
    } else {
        //buscar todos os gastos ativos
        gastos = await db.expense.findMany({
            where: {
                deletedAt: null,
                person: {
                    userId: usuario.id,
                    deletedAt: null
                }
            },
            select: {
                name: true,
                value: true,
                month: true,
                year: true,
                personId: true
            }
        })

    }

    return NextResponse.json({ success: true, message: 'Gastos buscados com sucesso!', data: gastos }, { status: 200 });

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


    const usuario = await db.user.findUnique({
        where: {
            email: session.user.email,
        },
    });

    if (!usuario) {
        return NextResponse.json({ success: false, message: 'Erro de autenticação' }, { status: 401 });
    }

    try {
        //Ao sobrescrever um mês/ano, os gastos anteriores são marcados como deletados
        //(soft delete) em vez de removidos, preservando o histórico para auditoria.
        const listaIdPessoasObj = await db.person.findMany({
            select: {
                id: true
            },
            where: {
                userId: usuario.id,
                deletedAt: null
            }
        })
        const idsPessoasArray = listaIdPessoasObj.map(pessoa => pessoa.id);
        await db.expense.updateMany({
            where: {
                month: despesaMes,
                year: despesaAno,
                personId: { in: idsPessoasArray },
                deletedAt: null
            },
            data: {
                deletedAt: new Date()
            }
        })

        //Cadastrar as novas despesas
        for (const pessoa of listaDespesasDeCadaPessoa) {
            if (pessoa.despesas.length > 0) {
                const idPessoa = pessoa.idPessoa;
                for (const despesa of pessoa.despesas) {
                    await db.expense.create({
                        data: {
                            name: despesa.identificacao,
                            value: despesa.valor,
                            month: despesaMes,
                            year: despesaAno,
                            personId: idPessoa
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
