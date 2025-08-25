//TODO => Separar responsabilidades dos hooks que controlam as pessoas e o hook que controla as despesas em si.

import { useState } from "react";

export const useCadastroPessoas = () => {
    const [pessoas, setPessoas] = useState([]);
    const [etapa, setEtapa] = useState(0);



    //Criar um array de objetos Pessoa com o numero de pessoas escolhidas
    const criarArrayPessoas = (numeroPessoas) => {
        let listaPessoas = [];
        for(let i = 0; i < numeroPessoas; i++){
            const novaPessoa = {"nome" : "", "cpf" : ""}; //Forma mais simples de utilizar um objeto
            listaPessoas.push(novaPessoa);
        }
        return listaPessoas;
    }

    const handleConfirmaNumeroPessoas = (numeroPessoas) => {
        const listaPessoas = criarArrayPessoas(numeroPessoas);
        setPessoas(listaPessoas);
    }

    const handlePrevEtapa = () => {
        if(etapa !== 0) {setEtapa(prev => prev - 1);};
    }

    const handleNextEtapa = (event, pessoaTemporaria, etapa) => {
        if (event) {event.preventDefault()};
        //Validar CPF => 
        handlePessoaDados(pessoaTemporaria, etapa);
        setEtapa(prev => prev + 1);
    }

    const handlePessoaDados = (dados, index) => {
        setPessoas((prev) => {
            const newPessoas = [...prev];
            newPessoas[index] = dados;
            return newPessoas;
        });
    }




    return{pessoas, etapa, handleConfirmaNumeroPessoas, handlePrevEtapa, handleNextEtapa}

}