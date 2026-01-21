import React from "react";
import { useCadastroDespesas } from "@/hooks/useCadastroDespesas";
import DespesaInfo from "./DespesaInfo";
import ConfirmaDespesa from "./ConfirmaDespesa";
import ResumoPagamento from "./ResumoPagamento";
import SobrescreveDespesa from "./SobrescreveDespesa";
import PessoasNaoCadastradas from "./PessoasNaoCadastradas";
import ResultadoCadastro from "./ResultadoCadastro";
import SeletorData from "../shared/SeletorData";
export default function CadastraDespesa({retornarAoMenu, handleOpcaoMenu, listaPessoas, listaDespesas, atualizarDespesas}) {
    const { 
        etapa, 
        mesAnoTexto,
        loading,
        selecionarMesAno,
        handleSobrescrever,
        adicionarNovaDespesa,
        handleAnteriorDespesa,
        handleProximaPessoa,
        handleAnteriorPessoa,
        finalizarCadastroDespesas,
        handleConfirmaCadastroDespesas,
        handleCancelaCadastroDespesas,
        avancarParaResumoPagamento,
        respostaCadastro,
        onCompartilharResumo,
        despesaDados,
        pessoaIndexDados,
        listaResumoDespesas,
        dadosPagamento,
        snackbar,
        fecharSnackbar,
        isUltimaDespesa,
        } = useCadastroDespesas({listaPessoas, atualizarDespesas});
        

    //Se o usuário não possuir pessoas cadastradas, deve retornar um menu avisando que ele precisa cadastrar pessoas antes e um botão de menu principal e outro que leva para tela de cadastrar Pessoa
    if (listaPessoas.length === 0) {
        return (
            <PessoasNaoCadastradas
                onRetornaAoMenu={retornarAoMenu}
                onCadastraPessoas={() => handleOpcaoMenu("cadastraPessoas")}
            />
        )
    }

    if (etapa === "selecaoMes") {
        return (
            <SeletorData
             onConfirmaEscolha={(mesSelecionado, anoSelecionado) => selecionarMesAno(mesSelecionado, anoSelecionado)}
             onCancela={retornarAoMenu}
             loading={loading}
             listaDespesas={listaDespesas}
              />

        )
    } else if (etapa === "confirmaSobrescreverDespesas") {
        return (
            <SobrescreveDespesa 
            onConfirmaSobrescrever={handleSobrescrever}
            onCancela={retornarAoMenu}
            mesAnoTexto={mesAnoTexto()}
            />
        )
    } else if (etapa === "cadastroDespesa") {
        return (
                <DespesaInfo 
                mesAnoTexto={mesAnoTexto()}
                despesaDados={despesaDados}
                pessoaIndexDados={pessoaIndexDados}
                onProxima={(formData) => adicionarNovaDespesa(formData)}
                onAnterior={handleAnteriorDespesa}
                onProximaPessoa={handleProximaPessoa}
                onAnteriorPessoa={handleAnteriorPessoa}
                onFinaliza={finalizarCadastroDespesas}
                snackbar={snackbar}
                onFecharSnackbar={fecharSnackbar}
                isUltimaDespesa={isUltimaDespesa}
                onRetornaAoMenu={retornarAoMenu}
                ></DespesaInfo>
        )

    } else if (etapa === "confirmaDespesa") {
        return (
                <ConfirmaDespesa 
                listaResumoDespesas={listaResumoDespesas}
                onConfirmar={handleConfirmaCadastroDespesas}
                onCancelar={handleCancelaCadastroDespesas}
                onRetornaAoMenu={retornarAoMenu}
                loading= {loading}
                 />
        )

    } else if (etapa === "resultadoCadastro") {
        return (
            <ResultadoCadastro
             respostaCadastro={respostaCadastro}
             onRetornaAoMenu={retornarAoMenu}
             onExibirResumo={avancarParaResumoPagamento}
            />
        )
    }
     else if (etapa === "resumoPagamento") {
        return (
            <ResumoPagamento
            dataEmTexto={mesAnoTexto}
            dadosPagamento={dadosPagamento}
            onRetornaAoMenu={retornarAoMenu}
            onCompartilhar={onCompartilharResumo}

            />

        )
    }





}