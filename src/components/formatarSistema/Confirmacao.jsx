import { useState } from "react";
import Loading from "../ui/Loading";
import styles from './Confirmacao.module.css';

export default function Confirmacao({ onRetornaAoMenu, onConfirmaFormatacao, loading }) {
    const [textoConfirmacao, setTextoConfirmacao] = useState("");

    const handleCancela = () => {
        onRetornaAoMenu();
    }

    const handleConfirma = () => {
        onConfirmaFormatacao(textoConfirmacao);

    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <Loading />
                </div>
                <div className='botoesContainer'>
                    <button className="botaoTexto" disabled={true} onClick={handleCancela}>Cancelar</button>
                    <button className="botaoTexto" disabled={true} onClick={handleConfirma}>Confirmar</button>
                </div>
            </div>

        )
    }


    return (
        <div className={styles.container}>
            <div className={styles.confirmacaoContainer}>
                <div className={styles.mensagemContainer}>
                    <p>Para concluir a ação, digite <span className={styles.destaque}>FORMATAR SISTEMA</span> e confirme</p>
                </div>

                <input type="text" value={textoConfirmacao} onChange={(e) => setTextoConfirmacao(e.target.value.toUpperCase())} />
            </div>

            <div className='botoesContainer'>
                <button className="botaoTexto" onClick={handleCancela}>Cancelar</button>
                <button className="botaoTexto" disabled={textoConfirmacao !== "FORMATAR SISTEMA" || loading} onClick={handleConfirma}>Confirmar</button>

            </div>
        </div>
    )

}