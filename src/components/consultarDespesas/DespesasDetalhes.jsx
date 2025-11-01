import { useRef } from "react";
import styles from './DespesasDetalhes.module.css';

export default function DespesasDetalhes({ despesasPessoa, retornarResumo, mesAnoTexto, onCompartilhar }) {

    

    const { despesas, pessoa } = despesasPessoa;
    const existemDespesasCadastradas = despesas.length > 0;

    const handleCompartilhar = () => {
        onCompartilhar(despesas, pessoa, mesAnoTexto());

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
        <div className={styles.container}>
            <h2>{mesAnoTexto()}</h2>
            <div className={styles.detalhesContainer}>
                <h3>{pessoa.name}</h3>
                <div className={styles.tabelaDespesasContainer}>
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

                <span className={styles.totalGasto}>{`${calcularTotalGasto()} R$, ${quantidadeDespesas()} despesas`}</span>

            </div>
            <div className="botoesContainer">
                <button className={"botaoIcone"} onClick={retornarResumo}>
                    <span>
                        <img src="./icons/retornarIcon.svg" alt="Voltar" />
                    </span>
                </button>
                <button className={"botaoIcone"} onClick={handleCompartilhar}>
                    <span>
                        <img src="./icons/compartilharIcon.svg" alt="Compartilhar" />
                    </span>
                </button>
            </div>



        </div>
    )
}