
import styles from "./DespesasNaoCadastradas.module.css"

export default function DespesasNaoCadastradas({ onRetornaSelecao, mesAnoTexto }) {

    return (
        <div className={styles.container}>
            <div className={styles.mensagemContainer}>
                <p>Não existem despesas cadastradas para {mesAnoTexto}.</p>
            </div>

            <button onClick={onRetornaSelecao}>
                <span className="botaoIcone">
                    <img src="/icons/retornarIcon.svg" alt="Retornar" />
                </span>
            </button>
        </div>
    )

}


