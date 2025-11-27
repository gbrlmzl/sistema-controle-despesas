"use client"
import { useState, useEffect, useRef } from "react";
import Snackbar from "../ui/Snackbar";
import styles from './PessoaInfo.module.css';
import Form from "next/form";


export default function PessoaInfo({ pessoa, onSave, pessoaAtualIndex, snackbarOpen, snackbarMensagem, snackBarOnClose, handlePrevEtapa, onProximo }) {
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

    const handleSubmit = (formData) => {


    }


    return (
        <div className={styles.container}>
            <h3>Pessoa {pessoaAtualIndex + 1}</h3>
            <Form className={styles.formContainer} action={(FormData) => onProximo(FormData, pessoaAtualIndex)}>
                <div className={styles.formCampos}>
                    <input name="nome" type="text" onChange={handleDados} placeholder="Nome" value={localPessoa.nome} required ref={inputRef} />
                    <input name="email" type="text" onChange={handleDados} placeholder="E-mail" value={localPessoa.email} required />
                </div>
                <div className="botoesContainer">
                    <button type="button" onClick={handlePrevEtapa} disabled={pessoaAtualIndex === 0}>
                        <span className="botaoIcone">
                            <img src="/icons/retornarIcon.svg" alt="Anterior" />
                        </span>
                    </button>
                    <button type="submit">
                        <span className="botaoIcone" >
                            <img src="/icons/avancarIcon.svg" alt="Próximo"/>
                        </span>
                    </button>
                </div>
            </Form>
            
            <Snackbar open={snackbarOpen} message={snackbarMensagem} onClose={snackBarOnClose} type={"error"} ></Snackbar>
            
        </div>

    )
}