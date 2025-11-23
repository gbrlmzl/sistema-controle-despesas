import db from "../../../../lib/prisma";
import { auth } from "../../../../auth";

export async function GET(req) {
    const session = await auth()
    if (!session) {
        return new Response(JSON.stringify({ success: false, message: "Usuário não autenticado" }), { status: 401 });
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
            where : {
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
        return new Response(JSON.stringify({ success: false, message: "Usuário não autenticado" }), { status: 401 });
    }//Se não tiver sessão, retorna erro 401 - não autorizado

    const dadosDespesas = await req.json();
    const listaDespesasDeCadaPessoa = dadosDespesas.lista;
    const despesaMes = dadosDespesas.mes;
    const despesaAno = dadosDespesas.ano;
    const sobrescrever = dadosDespesas.sobrescreverDespesas;

    const usuario = await db.usuario.findUnique({
        where: {
            email: session.user.email,
        },
    });

    if (sobrescrever === true) {
        const listaIdPessoasObj = await db.pessoa.findMany({
            select: {
                id: true
            },
            where: {
                idUsuario: usuario.id
            }
        })
        const idsPessoasArray = listaIdPessoasObj.map(pessoa => pessoa.id);
        const gastosExistentesDeletados = await db.gasto.deleteMany({
            where: {
                month: despesaMes,
                year: despesaAno,
                idPessoa: { in: idsPessoasArray }
            }
        })
        //verificar se já existem gastos cadastrados nesse mêsAno em nome das pessoas deste usuário.
        //caso exista, exclua do banco de dados.
    }





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

    return new Response(JSON.stringify({ success: true, message: "Despesas cadastradas com sucesso!" }), { status: 201 })



}