import { useRef } from "react";

export default function DespesasInfoResumo({ onRetornaAoMenu, mesAnoTexto, listaDespesasInfoFormatada, onCompartilhar, onAnteriorMes, onProximoMes, existeDespesaCadastrada }) {



    const resumoRef = useRef();




    const handleCompartilhar = () => {
        onCompartilhar(resumoRef);

    }

    return (
        <div>
            <div ref={resumoRef}>
                <div style={{ "display": "flex", "flexDirection": "row", "justifyContent": "space-between", "paddingInline": 5 }}>
                    <button style={{ borderRadius: 40 }} onClick={onAnteriorMes}>{"<"}</button>
                    <h2>{mesAnoTexto}</h2>
                    <button onClick={onProximoMes}>{">"}</button>

                </div>


                <table>
                    <thead>
                        <tr>
                            <th>Pessoa</th>
                            <th>Total gasto</th>
                            <th>Quantidade de despesas</th>
                            <th>Valor pago</th>
                            <th>Valor recebido</th>
                        </tr>
                    </thead>
                    <tbody>
                        {existeDespesaCadastrada ? (
                            listaDespesasInfoFormatada.map((pessoa, index) => (
                                <tr key={index}>
                                    <td>{pessoa.nomePessoa}</td>
                                    <td>{pessoa.totalGasto.toFixed(2)}</td>
                                    <td>{pessoa.numDespesas}</td>
                                    <td>{pessoa.paga ? pessoa.quantia.toFixed(2) : "0.00"}</td>
                                    <td>{pessoa.recebe ? pessoa.quantia.toFixed(2) : "0.00"}</td>
                                </tr>
                            ))) : (listaDespesasInfoFormatada.map((pessoa, index) => (
                                <tr key={index}>
                                    <td>{pessoa.nomePessoa}</td>
                                    <td>{"-"}</td>
                                    <td>{"-"}</td>
                                    <td>{"-"}</td>
                                    <td>{"-"}</td>
                                </tr>
                            )))
                        }

                        {existeDespesaCadastrada ? (
                            <tr>
                                <td>Total</td>
                                <td>{listaDespesasInfoFormatada.reduce((acc, pessoa) => acc + pessoa.totalGasto, 0).toFixed(2)}</td>
                                <td>{listaDespesasInfoFormatada.reduce((acc, pessoa) => acc + pessoa.numDespesas, 0)}</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>

                        ) : (
                            <tr>
                                <td>Total</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                        )
                        }
                    </tbody>
                </table>
            </div>

            <div>
                <button onClick={onRetornaAoMenu}>OK</button>
                <button onClick={handleCompartilhar}>Compartilhar</button>
            </div>

        </div>
    )



}