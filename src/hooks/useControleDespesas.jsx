import { useState } from "react";
import Pessoa from "../entities/Pessoa"


export const useControleDespesas = () =>{
    //pessoas
    //Será modificado para quando existir pessoas cadastradas no banco de dados, essas pessoas serem a pessoaUm e pessoaDois.
    const pessoaUm = new Pessoa("pessoaUm", null); 
    const pessoaDois = new Pessoa("pessoaDois", null);
    const listaPessoas = [pessoaUm, pessoaDois];
    
    //useStates
    const [opcaoMenu, setOpcaoMenu] = useState("menu");
    const [pessoas, setPessoas] = useState(listaPessoas);




    

    //handlers
    const handleOpcaoMenu = (opcao) =>{
        setOpcaoMenu(opcao);
    }

    const handleDadosPessoa = (nome, cpf, numPessoa) => {




        
    }









    return{opcaoMenu, pessoas, handleOpcaoMenu }
}