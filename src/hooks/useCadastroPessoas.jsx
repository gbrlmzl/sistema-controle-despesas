//TODO => Separar responsabilidades dos hooks que controlam as pessoas e o hook que controla as despesas em si.

import { useState } from "react";

export const useCadastroPessoas = () => {
    const [pessoas, setPessoas] = useState([]);
    const [etapa, setEtapa] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");




    //Criar um array de objetos Pessoa com o numero de pessoas escolhidas
    const criarArrayPessoas = (numeroPessoas) => {
        let listaPessoas = [];
        for(let i = 0; i < numeroPessoas; i++){
            const novaPessoa = {"nome" : "", "email" : ""}; //Forma mais simples de utilizar um objeto
            listaPessoas.push(novaPessoa);
        }
        return listaPessoas;
    }
    
    const mostrarSnackbar = (msg) => {
        setSnackbarMsg(msg);
        setSnackbarOpen(true);
        //setTimeout(() => setSnackbarOpen(false), 5000);
    };
    
    const handleFecharSnackbar = () => {
        setSnackbarOpen(false);
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
        if(validarEmail(pessoaTemporaria.email)){
            handlePessoaDados(pessoaTemporaria, etapa);
            setEtapa(prev => prev + 1);
            setSnackbarOpen(false); //Fecha o snackbar caso ele esteja aberto

        }else{
            mostrarSnackbar("Insira um email válido!")           
        }
    }

    const handlePessoaDados = (dados, index) => {
        setPessoas((prev) => {
            const newPessoas = [...prev];
            newPessoas[index] = dados;
            return newPessoas;
        });
    }

    const validarEmail = (email) => {
        const emailRegex = /\w+@\w+\.\w+/
        return emailRegex.test(email);
    
    }




    return{pessoas, etapa, snackbarOpen, snackbarMsg, handleFecharSnackbar, handleConfirmaNumeroPessoas, handlePrevEtapa, handleNextEtapa}

}