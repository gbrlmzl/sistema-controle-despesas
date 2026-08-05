import styles from "./ResumoPagamento.module.css";

export default function ResumoPagamento({ dataEmTexto, dadosPagamento, onRetornaAoMenu, onCompartilhar }) {

    
    const handleOk = () => {
        onRetornaAoMenu();
    }

    const handleCompartilhar = () => {
        onCompartilhar({dadosPagamento: dadosPagamento, mesAnoTexto: dataEmTexto()});
    }



    return (
        <div className={styles.container}>
            <div className={styles.resumoContainer}>
                <h3>{dataEmTexto()}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Pessoa</th>
                            <th>Recebe</th>
                            <th>Paga</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dadosPagamento.map(pessoa => (
                            <tr key={pessoa.nomePessoa}>
                                <td>{pessoa.nomePessoa}</td>
                                <td>{pessoa.recebe ? pessoa.quantia.toFixed(2) : 0}</td>
                                <td>{pessoa.paga ? pessoa.quantia.toFixed(2) : 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.botoesContainer}>
                <button onClick={handleCompartilhar}>
                    <span className="botaoIcone">
                        <img src="/icons/compartilharIcon.svg" alt="Compartilhar" />
                    </span>
                </button>
                <button onClick={handleOk}>
                    <span className="botaoIcone">
                        <img src="/icons/confirmarIcon.svg" alt="Confirmar" />
                    </span>
                </button>
            </div>
        </div>
    )



}