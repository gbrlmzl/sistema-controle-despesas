import { useRef } from "react";

export default function DespesasDetalhes({ despesasPessoa, retornarResumo, mesAnoTexto, onCompartilhar }) {

    const despesasDetalhesRef = useRef();

    const { despesas, pessoa } = despesasPessoa;
    const existemDespesasCadastradas = despesas.length > 0;

    const handleCompartilhar = () => {
        onCompartilhar({despesasDetalhesRef: despesasDetalhesRef, pessoaNome: pessoa.name});

    }

    const calcularTotalGasto = () => {
        if (!existemDespesasCadastradas) {
            return "0";
        } else {
            return despesas.reduce((acc, despesa) => acc + despesa.value, 0).toFixed(2);
        }
    }
    const quantidadeDespesas = () => {
        if (!existemDespesasCadastradas) {
            return "0";
        } else {
            return despesas.length;
        }
    }
    return (
        <div>
            <div>
                <div>
                    <h2>{mesAnoTexto()}</h2>
                </div>
                <div>
                    <h3>{pessoa.name}</h3>
                </div>
                <div>
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Despesa</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {existemDespesasCadastradas ? (
                                    despesas.map((despesa, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{despesa.name}</td>
                                            <td>{despesa.value.toFixed(2)}</td>
                                        </tr>
                                    ))) :
                                    (<tr>
                                        <td colSpan={2}>Nenhuma despesa cadastrada</td>
                                    </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <span style={{ backgroundColor: "lightblue" }}>{`${calcularTotalGasto()} R$, ${quantidadeDespesas()} despesas`}</span>
                    </div>
                </div>
            </div>
            <div ref={despesasDetalhesRef} className="tabelaCompartilhamento" style={{"position": "absolute", "left": "-9999px", padding: 15, fontFamily: "cursive"}}>
                <div>
                    <h2>{mesAnoTexto()}</h2>
                </div>
                <div>
                    <h3>{pessoa.name}</h3>
                </div>
                <div>
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Despesa</th>
                                    <th>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {existemDespesasCadastradas ? (
                                    despesas.map((despesa, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{despesa.name}</td>
                                            <td>{despesa.value.toFixed(2)}</td>
                                        </tr>
                                    ))) :
                                    (<tr>
                                        <td colSpan={2}>Nenhuma despesa cadastrada</td>
                                    </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <span style={{ backgroundColor: "lightblue" }}>{`${calcularTotalGasto()} R$, ${quantidadeDespesas()} despesas`}</span>
                    </div>
                </div>
            </div>
            


            <div>
                <button onClick={retornarResumo}>Retornar</button>
                <button onClick={handleCompartilhar}>Compartilhar</button>
            </div>



        </div>
    )
}