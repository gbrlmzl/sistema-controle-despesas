"use client"


export default function ConfirmaPessoas({pessoas, onConfirma}){


    const handleConfirma = () => {
        if(onConfirma){onConfirma()};
    }

    const lista = pessoas.map((person, idx) => <li key={idx}>{person.nome} <br /> {person.cpf}</li>);


    return(
        <div>
            <div>
                <h2>Confirmação</h2>
            </div>
            <ul>
                {lista}
            </ul>
            <div>
                <button onClick={handleConfirma}>Confirmar</button>
            </div>
        </div>
    )

}