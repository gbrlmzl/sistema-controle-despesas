
import Loading from "../ui/Loading";
import styles from './ConfirmaDespesa.module.css';

export default function ConfirmaDespesa({ listaResumoDespesas, onConfirmar, onCancelar, onRetornaAoMenu, loading }) {
    const handleConfirma = () => {
        onConfirmar();
    }
    const handleCancela = () => {
        onCancelar();
    }

    const handleRetornaAoMenu = () => {
        onRetornaAoMenu();
    }


    if (loading) { //Se estiver carregando, mostra a animação de loading
        return (
            <div>
                <Loading />
            </div>
        )
    }


    return (
        <div className={styles.container}>
            <h2>Resumo</h2>

            <div className={styles.resumoContainer}>
                <table>
                    <thead>
                        <tr >
                            <th>Pessoa</th>
                            <th>Total</th>
                            <th>Quantidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listaResumoDespesas().map((resumo, index) => (
                            <tr key={index}>
                                <td >{resumo.nomeResponsavel}</td>
                                <td>{resumo.somaDespesas.toFixed(2)}</td>
                                <td>{resumo.quantDespesas}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

            <div className={styles.botoesContainer}>
                <button onClick={handleCancela}>
                    <span className="botaoIcone">
                        <img src="/icons/retornarIcon.svg" alt="Cancelar" />
                    </span>
                </button>
                <button onClick={handleConfirma}>
                    <span className="botaoIcone">
                        <img src="/icons/confirmarIcon.svg" alt="Confirmar" />
                    </span>
                </button>
            </div>

        </div>
    )
}