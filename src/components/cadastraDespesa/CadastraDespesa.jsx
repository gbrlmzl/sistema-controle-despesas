import React from "react";
import { useCadastroDespesas } from "@/hooks/useCadastroDespesas";
import { useState } from "react";
import SelecionaMes from "./SelecionaMes";
import DespesaInfo from "./DespesaInfo";
export default function CadastraDespesa({retornarAoMenu, handleOpcaoMenu, listaDespesas, listaPessoas}) {
    const { etapa, mesAnoTexto, loading, existeDespesaCadastrada, handleConfirmaEscolha, handleSobrescrever, handleProximaDespesa, handleFinalizar, pessoaAtualIndex, despesaAtualIndex, somaDespesasPessoaAtual } = useCadastroDespesas(listaDespesas, listaPessoas);
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
                
                <DespesaInfo nomePessoa={pessoasArray[pessoaAtualIndex].name}
                onProxima={(formData) => handleProximaDespesa(formData)}
                numDespesa={despesaAtualIndex}
                somaDespesas={somaDespesasPessoaAtual}

                 ></DespesaInfo>
            </div>
            
        )

    }





}