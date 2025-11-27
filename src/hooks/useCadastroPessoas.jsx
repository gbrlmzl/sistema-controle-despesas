//TODO => Separar responsabilidades dos hooks que controlam as pessoas e o hook que controla as despesas em si.

import { useEffect, useState } from "react";

export const useCadastroPessoas = ({atualizarPessoas}) => {
    const [pessoas, setPessoas] = useState([]);

    const etapas = ["selecaoNumeroPessoas", "cadastroPessoas", "confirmaCadastroPessoas", "resultadoCadastro"];
    const [etapa, setEtapa] = useState(etapas[0]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [loadingCadastro, setLoadingCadastro] = useState(false);
    const [pessoaAtualIndex, setPessoaAtualIndex] = useState(0);
    const [respostaCadastro, setRespostaCadastro] = useState(null);
    


    useEffect(() => {
        if (respostaCadastro?.success === true) {
            //chamar a função para atualizar a lista de pessoas no hook useControleDespesas
            atualizarPessoas();
        }
    }, [respostaCadastro]);
    
    //Criar um array de objetos Pessoa com o numero de pessoas escolhidas
    const criarArrayPessoas = (numeroPessoas) => {
        let listaPessoas = [];
        for (let i = 0; i < numeroPessoas; i++) {
            const novaPessoa = { "nome": "", "email": "" }; //Forma mais simples de utilizar um objeto
            listaPessoas.push(novaPessoa);
        }
        return listaPessoas;
    }

    const mostrarSnackbar = (msg) => {
        setSnackbarMsg(msg);
        setSnackbarOpen(true);
    };

    const handleFecharSnackbar = () => {
        setSnackbarOpen(false);
    }

    const handleConfirmaNumeroPessoas = (numeroPessoas) => {
        const listaPessoas = criarArrayPessoas(numeroPessoas);
        setPessoas(listaPessoas);
        setEtapa(etapas[1]); //Avança para a próxima etapa de cadastro de pessoas
    }



    const handlePrevEtapa = () => {
        if(etapa === "confirmaCadastroPessoas"){
            setEtapa(etapas[1]);
            return;
        }

    }

    const pessoaAnterior = () => {
        if (pessoaAtualIndex > 0) {
            setPessoaAtualIndex(pessoaAtualIndex - 1);
        }
    }

    const handleNextEtapa = (formData, etapa) => {
        //if (event) { event.preventDefault() };
        //Validar CPF =>
        const nomePessoa = formData.get("nome");
        const emailPessoa = formData.get("email");

        
        if (validarEmail(emailPessoa)) {
            adicionaNovaPessoa({nome: nomePessoa, email: emailPessoa}, etapa);
            setSnackbarOpen(false); //Fecha o snackbar caso ele esteja aberto
            if (etapa < pessoas.length - 1) {
                setPessoaAtualIndex(pessoaAtualIndex + 1);
            }else{
                setEtapa(etapas[2]); //Avança para a etapa de confirmação de cadastro
            }


        } else {
            mostrarSnackbar("Insira um email válido!")
        }
    }

    const adicionaNovaPessoa = (dados, index) => {
        setPessoas((prev) => {
            const newPessoas = [...prev];
            newPessoas[index] = dados;
            return newPessoas;
        });
    }

    const handleCadastrarPessoas = async (listaPessoasACadastrar) => {
        if (loadingCadastro) return; // Impede execução se já estiver carregando
        setLoadingCadastro(true);

        try {
            const response = await fetch("/api/pessoas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    listaPessoasACadastrar
                }),

            });

            const resultadoCadastro = await response.json();
            setRespostaCadastro(resultadoCadastro);
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingCadastro(false);
            setEtapa(etapas[3]); //Avança para a etapa de resultado do cadastro


        }
    }

    const validarEmail = (email) => { //usar uma biblioteca especializada de validação?
        const emailRegex = /\S+@\S+\.\S+/
        return emailRegex.test(email);

    }




    return { 
          pessoas,
          etapa,
          snackbarOpen, 
          snackbarMsg, 
          loadingCadastro, 
          respostaCadastro,
          pessoaAtualIndex, 
          handleFecharSnackbar, 
          handleConfirmaNumeroPessoas,
          pessoaAnterior, 
          handlePrevEtapa, 
          handleNextEtapa, 
          handleCadastrarPessoas
        }

}