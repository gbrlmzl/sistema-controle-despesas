import React from "react";
import { useCadastroDespesas } from "@/hooks/useCadastroDespesas";
import DespesaInfo from "./DespesaInfo";
import ConfirmaDespesa from "./ConfirmaDespesa";
import ResumoPagamento from "./ResumoPagamento";
import SobrescreveDespesa from "./SobrescreveDespesa";
import SeletorMes from "../shared/SeletorMes";
import PessoasNaoCadastradas from "./PessoasNaoCadastradas";
export default function CadastraDespesa({retornarAoMenu, handleOpcaoMenu, listaPessoas, atualizarDespesas}) {
    const { 
        etapa, 
        mesAnoTexto,
        loading,
        existeDespesaCadastrada,
        selecionarMesAno,
        handleSobrescrever,
        handleProximaDespesa,
        handleAnteriorDespesa,
        handleProximaPessoa,
        handleAnteriorPessoa,
        handleFinalizar,
        handleConfirmaCadastroDespesas,
        handleCancelaCadastroDespesas,
        handleCompartilharResumo,
        despesaDados,
        pessoaIndexDados,
        listaResumoDespesas,
        dadosPagamento,
        snackbar,
        fecharSnackbar,
        isUltimaDespesa,
        sucessoCadastro} = useCadastroDespesas({listaPessoas, atualizarDespesas});
        
    const pessoasArray = listaPessoas.pessoas; //transforma o objeto em array

    //Se o usuário não possuir pessoas cadastradas, deve retornar um menu avisando que ele precisa cadastrar pessoas antes e um botão de menu principal e outro que leva para tela de cadastrar Pessoa
    if (pessoasArray.length === 0) {
        return (
            <PessoasNaoCadastradas
                onRetornaAoMenu={retornarAoMenu}
                onCadastraPessoas={() => handleOpcaoMenu("cadastraPessoas")}
            />
        )
    }

    if (etapa === "selecaoMes") {
        return (
            <SeletorMes
             titulo="Cadastrar Despesas"
             onConfirmaEscolha={(mesSelecionado, anoSelecionado) => selecionarMesAno(mesSelecionado, anoSelecionado)}
             onCancela={retornarAoMenu}
             loading={loading}
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
                onProxima={(formData) => handleProximaDespesa(formData)}
                onAnterior={handleAnteriorDespesa}
                onProximaPessoa={handleProximaPessoa}
                onAnteriorPessoa={handleAnteriorPessoa}
                onFinaliza={handleFinalizar}
                snackbar={snackbar}
                onFecharSnackbar={fecharSnackbar}
                isUltimaDespesa={isUltimaDespesa}
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
                sucesso={sucessoCadastro}
                 />
        )

    } else if (etapa === "resumoPagamento") {
        return (
            <ResumoPagamento
            dataEmTexto={mesAnoTexto}
            dadosPagamento={dadosPagamento}
            onRetornaAoMenu={retornarAoMenu}
            onCompartilhar={handleCompartilharResumo}

            />

        )
    }





}