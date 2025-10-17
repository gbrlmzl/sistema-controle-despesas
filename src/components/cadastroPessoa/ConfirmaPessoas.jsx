"use client"
import Loading from "../ui/Loading";

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
            <div>
                <Loading />
            </div>
        )
    }

    if (sucesso === true) { 
        return (
            <>
                <div>
                    <h2>Cadastro realizado com sucesso!</h2>
                </div>
                <div>
                    <button onClick={retornarAoMenu}>Voltar ao menu</button>
                </div>
            </>
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
            <div>
                <div>
                    <h2>Confirmação</h2>
                </div>
                <ul>
                    {lista}
                </ul>
                <div>
                    <button onClick={handleConfirma}>Confirmar</button>
                    <button onClick={handleRetorna}>Retornar</button>
                </div>
            </div>
        )
    }

}