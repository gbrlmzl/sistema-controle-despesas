"use client"
import Loading from "../ui/Loading";
import styles from "./ConfirmaPessoas.module.css";

export default function ConfirmaPessoas({ pessoas, onConfirma, voltarEtapa }) {


    const handleConfirmar = () => {
        onConfirma(pessoas)
    
    }

    const handleRetornar = () => {
        voltarEtapa();
    }

    const lista = pessoas.map((person, idx) => <li key={idx}>{person.nome} <br /> {person.cpf}</li>);


    return (
        <div className={styles.container}>
            <h3>Confirmação</h3>
            <div className={styles.listaPessoasContainer}>
                <ol>
                    {lista}
                </ol>
            </div>

            <div className={styles.botoesContainer}>
                <button onClick={handleRetornar}>
                    <span className="botaoIcone">
                        <img src="/icons/retornarIcon.svg" alt="Cancelar" />
                    </span>
                </button>
                <button onClick={handleConfirmar}>
                    <span className="botaoIcone">
                        <img src="/icons/confirmarIcon.svg" alt="Confirmar" />
                    </span>

                </button>
            </div>
        </div>
    )
}

