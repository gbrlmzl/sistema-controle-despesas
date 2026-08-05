import styles from './DespesasInfoResumo.module.css';

export default function DespesasInfoResumo({ onRetornaAoMenu, mesAnoTexto, listaDespesasInfoFormatada, onCompartilhar, onAnteriorMes, onProximoMes, existeDespesaCadastrada }) {

    const handleCompartilhar = () => {
        onCompartilhar({listaDespesasInfoFormatada, existeDespesaCadastrada, mesAnoTexto});

    }

    return (
        <div className={styles.container}>
            <div className={styles.botoesNavMesContainer}>
                <button className="botaoNavegacaoIcone" onClick={onAnteriorMes}>
                    <span>
                        <img src="/icons/anteriorNavIcon.svg" alt="Mês anterior" />
                    </span>
                </button>
                <h3>{mesAnoTexto}</h3>
                <button className="botaoNavegacaoIcone" onClick={onProximoMes}>
                    <span>
                        <img src="/icons/avancarNavIcon.svg" alt="Próximo mês" />
                    </span>
                </button>

            </div>
            <div className={styles.resumoContainer}>
                <table>
                    <thead>
                        <tr>
                            <th>Pessoa</th>
                            <th>Total gasto</th>
                            <th>Despesas</th>
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
                    </tbody>
                    <tfoot>
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
                    </tfoot>
                </table>
            </div>
            <div className="botoesContainer">
                <button  onClick={onRetornaAoMenu}>
                    <span className="botaoIcone">
                        <img src="/icons/retornarIcon.svg" alt="Retornar" />
                    </span>
                </button>
                <button onClick={handleCompartilhar} disabled={!existeDespesaCadastrada}>
                    <span className="botaoIcone">
                        <img src="/icons/compartilharIcon.svg" alt="Compartilhar" />
                    </span>
                </button>
            </div>
        </div>
    )



}