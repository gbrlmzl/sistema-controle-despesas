import React from "react";
import { useCadastroDespesas } from "@/hooks/useCadastroDespesas";
import SelecionaMes from "./SelecionaMes";
import DespesaInfo from "./DespesaInfo";
import ConfirmaDespesa from "./ConfirmaDespesa";
import ResumoPagamento from "./ResumoPagamento";
export default function CadastraDespesa({retornarAoMenu, handleOpcaoMenu, listaPessoas, atualizarDespesas}) {
    const { 
        etapa, 
        mesAnoTexto,
        loading,
        existeDespesaCadastrada,
        handleConfirmaEscolha,
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
        sucessoCadastro} = useCadastroDespesas({listaPessoas, atualizarDespesas});
        
    const pessoasArray = listaPessoas.pessoas; //transforma o objeto em array

    //Se o usuário não possuir pessoas cadastradas, deve retornar um menu avisando que ele precisa cadastrar pessoas antes e um botão de menu principal e outro que leva para tela de cadastrar Pessoa
    if (pessoasArray.length === 0) {
        return (
            <div>
                <h2>Você precisa cadastrar pessoas antes de cadastrar despesas.</h2>
                <button onClick={() => handleOpcaoMenu("cadastraPessoas")}>Cadastrar Pessoas</button>
                <button onClick={retornarAoMenu}>Menu Principal</button>    
            </div>
        )
    }

    if (etapa === "selecaoMes") {
        return (
            <SelecionaMes onConfirmaEscolha={(mesSelecionado, anoSelecionado) => handleConfirmaEscolha(mesSelecionado, anoSelecionado)}
             onCancela={retornarAoMenu}
             onSobrescrever={handleSobrescrever}
             loading={loading}
             existeDespesaCadastrada={existeDespesaCadastrada}
              />

        )
    } else if (etapa === "cadastroDespesa") {
        return (
            <div>
                <h2>Cadastro de Despesa</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <h3>{mesAnoTexto()}</h3>
                </div>
                
                <DespesaInfo 
                despesaDados={despesaDados}
                pessoaIndexDados={pessoaIndexDados}
                onProxima={(formData) => handleProximaDespesa(formData)}
                onAnterior={handleAnteriorDespesa}
                onProximaPessoa={handleProximaPessoa}
                onAnteriorPessoa={handleAnteriorPessoa}
                onFinaliza={handleFinalizar}
                ></DespesaInfo>
            </div>
            
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