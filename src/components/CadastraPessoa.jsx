"use client"

import { useEffect, useState } from "react"

export default function CadastraPessoa({pessoa, etapa, onSave}){
    //localData
    const [localPessoa, setLocalPessoa] = useState(pessoa); //Estado local para armazenar os dados da pessoa temporariamente
    
    useEffect(() => {
        setLocalPessoa(pessoa);
    }, [pessoa]); //Mantem o localData sincronizado com os dados da pessoa que o componente pai manda

    useEffect(() =>{
        if (onSave){onSave(localPessoa)}
    },[localPessoa, onSave]); //TODO aprender o que esse useEffect faz => Envia as mudanças do localData para o componente pai quando o onSave é ativado

    const handleDados = (e) => {
        const{name, value} = e.target;
        setLocalPessoa((prev) => ({...prev, [name]: value}));


    }




    return (
        <div style={{color: "black"}}>
            <div> 
                <h2>Cadastrar Pessoas</h2>
            </div>
            <div>
                <h3>Pessoa {etapa}</h3>
            </div>
            <div className="formCampos">
                <form action="">
                    <input name="nome" type="text" onChange={handleDados} placeholder="Nome" value={localPessoa.getNome()} />
                    <input name="cpf" type="text" onChange={handleDados} placeholder="CPF" value={localPessoa.getCpf()} /> {/*TODO => REGEX verificador de CPF */}
                </form>
            </div>
            <div className="formBotoes">
                <button>X</button>
                <button type="submit">Próximo</button>
            </div>

        </div>
    )

}