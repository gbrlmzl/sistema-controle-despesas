"use client"

import { useEffect, useRef, useState } from "react"
import SeletorNumeroPessoas from "./SeletorNumeroPessoas";
import PessoaInfo from "./PessoaInfo";
import { useCadastroPessoas } from "@/hooks/useCadastroPessoas";
import ConfirmaPessoas from "./ConfirmaPessoas";



export default function CadastraPessoa({ handleOpcaoMenu, atualizarPessoas, existemPessoasCadastradas }) {
    const {
        pessoas,
        handleConfirmaNumeroPessoas,
        etapa,
        snackbarOpen,
        snackbarMsg,
        loadingCadastro,
        sucessoCadastro,
        handleFecharSnackbar,
        handlePrevEtapa,
        handleNextEtapa,
        handleCadastrarPessoas
    } = useCadastroPessoas({atualizarPessoas});


    const pessoaTemporaria = useRef(pessoas[etapa]);

    const handleNumeroPessoas = (numero) => {
        //chamar função do hook useCadastroPessoas para criar o array com numero X de pessoas e substituir o array vazio
        if (handleConfirmaNumeroPessoas) { handleConfirmaNumeroPessoas(numero) };
    }

    const numeroPessoas = () => {
        return pessoas.length;
    }

    const retornarAoMenu = () => {
        handleOpcaoMenu("sistema");
    }

    const retornarAoMenuPrincipal = () => {
        handleOpcaoMenu("menu");
    }



    if (existemPessoasCadastradas() && sucessoCadastro === null) {
        return (<div>
            <h2>Já existem pessoas cadastradas no sistema.</h2>
            <p>Para modificar as pessoas cadastradas, é necessário formatar o sistema.</p>
            <button onClick={retornarAoMenuPrincipal}>Retornar ao Menu Principal</button>
        </div>)
    }
    if (numeroPessoas() === 0) {
        return (
            <SeletorNumeroPessoas onCancela={retornarAoMenu} onConfirma={(numero) => handleNumeroPessoas(numero)} />

        )
    }
    if (numeroPessoas() > 0 && etapa < numeroPessoas()) {
        return (
            <div>
                <form onSubmit={(event) => handleNextEtapa(event, pessoaTemporaria.current, etapa)}>
                    <div>
                        <PessoaInfo pessoa={pessoas[etapa]} onSave={(value) => pessoaTemporaria.current = value} etapa={etapa} snackbarOpen={snackbarOpen} snackbarMensagem={snackbarMsg} snackBarOnClose={handleFecharSnackbar}></PessoaInfo>
                    </div>
                    <div /* Menu de navegação */>
                        <button type="button" onClick={handlePrevEtapa} disabled={etapa == 0}>Anterior</button>
                        <button type="submit">Próximo</button>
                    </div>

                </form>

            </div>

        )
    }
    if (etapa === numeroPessoas()) {
        return (
            <ConfirmaPessoas pessoas={pessoas}
                onConfirma={handleCadastrarPessoas}
                loading={loadingCadastro}
                sucesso={sucessoCadastro}
                retornarAoMenu={retornarAoMenuPrincipal}
                voltarEtapa={handlePrevEtapa}
            />
        )
    }

}