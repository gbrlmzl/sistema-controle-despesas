



export default function ResumoFormatacao({ resultadoFormatacaoData, onRetornaAoMenu }) {



    if (resultadoFormatacaoData) {
        return (
            <div>
                <h2>Formatar sistema</h2>
                <div>
                    <h3>Sistema formatado com sucesso</h3>
                    <ul>
                        <li>Total de gastos deletados: {resultadoFormatacaoData.gastosDeletados}</li>
                        <li>Total de pessoas deletadas: {resultadoFormatacaoData.pessoasDeletadas}</li>
                    </ul>
                </div>
                <div>
                    <button onClick={onRetornaAoMenu}>Retornar ao menu</button>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <div>
                    <h2>Formatar sistema</h2>
                    <p>Ocorreu um erro ao formatar o sistema. Tente novamente mais tarde.</p>

                </div>
                <div>
                    <button onClick={onRetornaAoMenu}>Retornar ao menu</button>
                </div>
            </div>


        )
    }




}