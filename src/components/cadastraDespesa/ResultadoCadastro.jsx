import styles from "./ResultadoCadastro.module.css";

export default function ResultadoCadastro({respostaCadastro, onRetornaAoMenu, onExibirResumo}) {




    return (
        <div className={styles.container}>
            <div className={styles.mensagemContainer}>
                {respostaCadastro?.success ? (
                    <div className={styles.mensagemSucesso}>
                        <h3>{respostaCadastro?.message}</h3>
                    </div>
                ) : (
                    <div className={styles.mensagemErro}>
                        <h3>{respostaCadastro?.message}</h3>
                    </div>
                )}
            </div>
            <div className={styles.botoesContainer}>
                <button onClick={onRetornaAoMenu}>
                    <span className="botaoPrimario">
                        <p>Menu</p>
                    </span>
                </button>
            </div>
        </div>
    )



}