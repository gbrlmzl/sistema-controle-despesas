//TODO => Separar responsabilidades dos hooks que controlam as pessoas e o hook que controla as despesas em si.

import { useEffect, useState } from "react";

export const useCadastroPessoas = ({atualizarPessoas}) => {
    const [pessoas, setPessoas] = useState([]);
    const [etapa, setEtapa] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [loadingCadastro, setLoadingCadastro] = useState(false);
    const [sucessoCadastro, setSucessoCadastro] = useState(null); // null = não tentou cadastrar, true = sucesso, false = falha
    


    useEffect(() => {
        if (sucessoCadastro === true) {
            //chamar a função para atualizar a lista de pessoas no hook useControleDespesas
            atualizarPessoas();
        }
    }, [sucessoCadastro]);
    
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
        if (etapa !== 0) { setEtapa(prev => prev - 1); };
    }

    const handleNextEtapa = (formData, etapa) => {
        //if (event) { event.preventDefault() };
        //Validar CPF =>
        const nomePessoa = formData.get("nome");
        const emailPessoa = formData.get("email");

        
        if (validarEmail(emailPessoa)) {
            adicionaNovaPessoa({nome: nomePessoa, email: emailPessoa}, etapa);
            setEtapa(prev => prev + 1);
            setSnackbarOpen(false); //Fecha o snackbar caso ele esteja aberto

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
        //Recebe uma lista de objetos 'pessoa' com nome e email.
        //Faz um POST desse array para a rota api/pessoas
        //Recebe a resposta
        //Retorna sucesso ou falha.
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

            if (resultadoCadastro.success === true) {
                setSucessoCadastro(true); 
            } else {
                setSucessoCadastro(false); // Indica falha no cadastro
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingCadastro(false);


        }
    }

    const validarEmail = (email) => { //usar uma biblioteca especializada de validação?
        const emailRegex = /\S+@\S+\.\S+/
        return emailRegex.test(email);

    }




    return { pessoas, etapa, snackbarOpen, snackbarMsg, loadingCadastro, sucessoCadastro, handleFecharSnackbar, handleConfirmaNumeroPessoas, handlePrevEtapa, handleNextEtapa, handleCadastrarPessoas}

}