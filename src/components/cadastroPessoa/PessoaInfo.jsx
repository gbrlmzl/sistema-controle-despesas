//Aqui será o componente filho de CadastraPessoa
"use client"
import { useState, useEffect } from "react";


export default function PessoaInfo({pessoa, onSave, etapa}){
    const [localPessoa, setLocalPessoa] = useState(pessoa); //Estado local para armazenar os dados da pessoa temporariamente
    
    useEffect(() => {
        setLocalPessoa(pessoa);
    }, [pessoa]); //Mantem o localData sincronizado com os dados da pessoa que o componente pai manda

    useEffect(() =>{
        if (onSave) {onSave(localPessoa)};
    },[localPessoa, onSave]); //Envia as mudanças do localData para o componente pai quando o onSave é ativado

    const handleDados = (e) => {
        const{name, value} = e.target;
        setLocalPessoa((prev) => ({...prev, [name]: value}));
    }


    return(
        <div style={{color: "black"}}>
            <div> 
                <h2>Cadastrar Pessoas</h2>
            </div>
            <div>
                <h3>Pessoa {etapa + 1}</h3>
            </div>
            <div className="formCampos">  
                <input name="nome" type="text" onChange={handleDados} placeholder="Nome" value={localPessoa.nome} />
                <input name="cpf" type="text" onChange={handleDados} placeholder="CPF" value={localPessoa.cpf} /> {/*TODO => REGEX verificador de CPF */}
            </div>
        </div>
    )
}