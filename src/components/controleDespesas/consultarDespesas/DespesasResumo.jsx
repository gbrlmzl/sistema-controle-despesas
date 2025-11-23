import styles from "./DespesasResumo.module.css";

export default function DespesasResumo({ despesasMesAnoSelecionado, listaPessoas, retornarSelecao, mesAnoTexto, mostrarDespesasPessoa, calcularResumoDespesas, onProximoMes, onAnteriorMes }) {
    
    const existemDespesasCadastradas = despesasMesAnoSelecionado.length > 0;
    const calcularTotalGasto = () => {
        if (!existemDespesasCadastradas){
            return "-";
        } else {
            return calcularResumoDespesas().reduce((acc, pessoa) => acc + pessoa.totalGasto, 0).toFixed(2);
        }
    }

    const handleExibirDetalhes = (pessoaId) => {
        mostrarDespesasPessoa(pessoaId);
    }


    return (
        <div className={styles.container}> 
            <div className={styles.botoesNavContainer}>
                <button className="botaoNavegacaoIcone" onClick={onAnteriorMes}>
                    <span>
                        <img src="./icons/anteriorNavIcon.svg" alt="Mês anterior" />
                    </span>
                </button>
                <h3>{mesAnoTexto()}</h3>
                <button className="botaoNavegacaoIcone" onClick={onProximoMes}>
                    <span>
                        <img src="./icons/avancarNavIcon.svg" alt="Próximo mês" />
                    </span>
                </button>
            </div>
            <div className={styles.resumoContainer}>
                <table>
                    <thead>
                        <tr>
                            <th>Pessoa</th>
                            <th>Pagou</th>
                            <th>Recebeu</th>
                            <th>Despesas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {existemDespesasCadastradas ? (
                            calcularResumoDespesas().map((pessoa, index) => (
                            <tr key={index}>
                                <td onClick={() => handleExibirDetalhes(pessoa.pessoaId)}>{pessoa.nomePessoa}</td>
                                <td>{pessoa.paga ? pessoa.quantia.toFixed(2) : "0.00"}</td>
                                <td>{pessoa.recebe ? pessoa.quantia.toFixed(2) : "0.00"}</td>
                                <td>{pessoa.numDespesas}</td>
                            </tr>
                        ))) : (
                            listaPessoas.pessoas.map((pessoa, index) => (
                                <tr key={index}>
                                    <td>{pessoa.name}</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{fontWeight: "bold"}}>Total</td>
                            <td>{calcularTotalGasto()}</td>
                            <td>X</td>
                            <td>{existemDespesasCadastradas ? despesasMesAnoSelecionado.length : "-"}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div className="botoesContainer">
                <button onClick={retornarSelecao}>
                    <span className="botaoIcone" >
                        <img src="./icons/retornarIcon.svg" alt="retornar" />
                    </span>
                </button>  
            </div>


        </div>
    )
}