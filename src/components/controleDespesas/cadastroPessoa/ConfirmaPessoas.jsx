"use client"
import Loading from "../ui/Loading";
import styles from "./ConfirmaPessoas.module.css";

export default function ConfirmaPessoas({ pessoas, onConfirma, loading, sucesso, retornarAoMenu, voltarEtapa }) {


    const handleConfirma = () => {
        if (onConfirma) {
            onConfirma(pessoas)
        };
    }

    const handleRetorna = () => {
        voltarEtapa();
    }

    const lista = pessoas.map((person, idx) => <li key={idx}>{person.nome} <br /> {person.cpf}</li>);

    if (loading) { //Se estiver carregando, mostra a animação de loading
        return (
            <Loading />
        )
    }

    if (sucesso === true) {
        return (
            <div className={styles.sucessoContainer}>
                <div className={styles.mensagemSucessoContainer}>
                    <p>Cadastro realizado com sucesso!</p>
                </div>

                <div className={styles.botoesContainer}>
                    <div> 
                    </div>
                    <button onClick={retornarAoMenu}>
                        <span className="botaoIcone">
                            <img src="/icons/confirmarIcon.svg" alt="Confirmar" />
                        </span>
                    </button>
                    <div>
                    </div>
                </div>
            </div>
        )
    }
    if (sucesso === false) { //Se o cadastro falhou, mostra a mensagem de erro
        return (
            <div>
                <h2>Erro ao cadastrar:</h2>
            </div>
        )
    }
    if (sucesso === null) { //Se ainda não tentou cadastrar, mostra a lista de pessoas a serem cadastradas e o botão de confirmar
        return (
            <div className={styles.container}>
                <h3>Confirmação</h3>
                <div className={styles.listaPessoasContainer}>
                    <ol>
                        {lista}
                    </ol>
                </div>

                <div className={styles.botoesContainer}>
                    <button onClick={handleRetorna}>
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

}