"use client"

import { useEffect, useRef, useState } from "react"
import SeletorNumeroPessoas from "./SeletorNumeroPessoas";
import PessoaInfo from "./PessoaInfo";
import { useCadastroPessoas } from "@/hooks/useCadastroPessoas";
import ConfirmaPessoas from "./ConfirmaPessoas";
import ExistemPessoasCadastradas from "./ExistemPessoasCadastradas";
import ResultadoCadastro from "./ResultadoCadastro";



export default function CadastraPessoa({ handleOpcaoMenu, atualizarPessoas, existemPessoasCadastradas }) {
    const {
        pessoas,
        handleConfirmaNumeroPessoas,
        etapa,
        snackbarOpen,
        snackbarMsg,
        loadingCadastro,
        pessoaAtualIndex,
        handleFecharSnackbar,
        pessoaAnterior,
        handlePrevEtapa,
        handleNextEtapa,
        handleCadastrarPessoas,
        respostaCadastro,
    } = useCadastroPessoas({ atualizarPessoas });


    const pessoaTemporaria = useRef(pessoas[pessoaAtualIndex]); //Armazena temporariamente os dados da pessoa enquanto o usuário edita

    const handleNumeroPessoas = (numero) => {
        //chamar função do hook useCadastroPessoas para criar o array com numero X de pessoas e substituir o array vazio
        if (handleConfirmaNumeroPessoas) {
            handleConfirmaNumeroPessoas(numero) 
        };
    }


    const retornarAoMenu = () => {
        handleOpcaoMenu("sistema");
    }

    const retornarAoMenuPrincipal = () => {
        handleOpcaoMenu("menu");
    }



    if (existemPessoasCadastradas() && respostaCadastro === null) {
        return (
            <ExistemPessoasCadastradas retornarAoMenuPrincipal={retornarAoMenuPrincipal} />)
    }
    if (etapa === "selecaoNumeroPessoas") {
        return (
            <SeletorNumeroPessoas onCancela={retornarAoMenu} onConfirma={(quantidade) => handleNumeroPessoas(quantidade)} />

        )
    }
    if (etapa === "cadastroPessoas") {
        return (
            <PessoaInfo
                pessoa={pessoas[pessoaAtualIndex]}
                onSave={(value) => pessoaTemporaria.current = value}
                pessoaAtualIndex={pessoaAtualIndex}
                snackbarOpen={snackbarOpen}
                snackbarMensagem={snackbarMsg}
                snackBarOnClose={handleFecharSnackbar}
                handlePrevEtapa={pessoaAnterior}
                onProximo={(FormData, etapa) => handleNextEtapa(FormData, etapa)}
            />
        )
    }
    if (etapa === "confirmaCadastroPessoas") {
        return (
            <ConfirmaPessoas pessoas={pessoas}
                onConfirma={handleCadastrarPessoas}
                retornarAoMenu={retornarAoMenuPrincipal}
                voltarEtapa={handlePrevEtapa}
            />
        )
    }
    if (etapa === "resultadoCadastro") {
        return (
            <ResultadoCadastro
            loading={loadingCadastro}
            respostaCadastro={respostaCadastro}
            onRetornaAoMenu={retornarAoMenuPrincipal}
                
            />
        )
    }

}