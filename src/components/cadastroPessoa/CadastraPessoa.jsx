"use client"

import { useEffect, useRef, useState } from "react"
import SeletorNumeroPessoas from "./SeletorNumeroPessoas";
import PessoaInfo from "./PessoaInfo";
import { useCadastroPessoas } from "@/hooks/useCadastroPessoas";
import ConfirmaPessoas from "./ConfirmaPessoas";
import ExistemPessoasCadastradas from "./ExistemPessoasCadastradas";



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
    } = useCadastroPessoas({ atualizarPessoas });


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
        return (
            <ExistemPessoasCadastradas retornarAoMenuPrincipal={retornarAoMenuPrincipal} />)
    }
    if (numeroPessoas() === 0) {
        return (
            <SeletorNumeroPessoas onCancela={retornarAoMenu} onConfirma={(numero) => handleNumeroPessoas(numero)} />

        )
    }
    if (numeroPessoas() > 0 && etapa < numeroPessoas()) {
        return (
            <PessoaInfo
                pessoa={pessoas[etapa]}
                onSave={(value) => pessoaTemporaria.current = value}
                etapa={etapa}
                snackbarOpen={snackbarOpen}
                snackbarMensagem={snackbarMsg}
                snackBarOnClose={handleFecharSnackbar}
                handlePrevEtapa={handlePrevEtapa}
                onProximo={(FormData, etapa) => handleNextEtapa(FormData, etapa)}
            />
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