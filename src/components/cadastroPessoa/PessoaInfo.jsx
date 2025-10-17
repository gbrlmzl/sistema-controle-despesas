//Aqui será o componente filho de CadastraPessoa
"use client"
import { useState, useEffect, useRef } from "react";
import Snackbar from "../Snackbar";

export default function PessoaInfo({ pessoa, onSave, etapa, snackbarOpen, snackbarMensagem, snackBarOnClose }) {
    const [localPessoa, setLocalPessoa] = useState(pessoa); //Estado local para armazenar os dados da pessoa temporariamente
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalPessoa(pessoa);
        inputRef.current.focus();
    }, [pessoa]); //Mantem o localData sincronizado com os dados da pessoa que o componente pai manda

    useEffect(() => {
        if (onSave) { onSave(localPessoa) };
    }, [localPessoa, onSave]); //Envia as mudanças do localData para o componente pai quando o onSave é ativado

    const handleDados = (e) => {
        const { name, value } = e.target;
        setLocalPessoa((prev) => ({ ...prev, [name]: value }));
    }


    return (
        <div style={{ color: "black" }}>
            <div>
                <h2>Cadastrar Pessoas</h2>
            </div>
            <div>
                <h3>Pessoa {etapa + 1}</h3>
            </div>
            <div className="formCampos">
                <input name="nome" type="text" onChange={handleDados} placeholder="Nome" value={localPessoa.nome} required ref={inputRef} />
                <input name="email" type="text" onChange={handleDados} placeholder="E-mail" value={localPessoa.email} required />
            </div>
            <div>
                <Snackbar open={snackbarOpen} message={snackbarMensagem} onClose={snackBarOnClose} ></Snackbar>
            </div>
        </div>
    )
}