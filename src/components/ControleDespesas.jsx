"use client"

import ControleDespesasMenu from "./ControleDespesasMenu";
import SistemaComponent from "./Sistema";  
import {useControleDespesas} from "../hooks/useControleDespesas";
import {useCadastroPessoas} from "../hooks/useCadastroPessoas"
import CadastraPessoa from "./cadastroPessoa/CadastraPessoa";
import CadastraDespesa from "./cadastraDespesa/CadastraDespesa";

function ControleDespesa(){
    const {opcaoMenu, listaPessoas, listaDespesas,handleOpcaoMenu, handleAtualizarListaPessoas} = useControleDespesas();

    const retornarAoMenu = () => {
        handleOpcaoMenu("menu");
    }
    



    
    

    if(opcaoMenu === "menu"){
        return <ControleDespesasMenu handleOpcaoMenu={handleOpcaoMenu}/>
    }
    if(opcaoMenu === "consultaDespesa"){
        //TODO ConsultaDespesa
    }
    if(opcaoMenu === "cadastraDespesa"){
        return <CadastraDespesa retornarAoMenu={retornarAoMenu}
        handleOpcaoMenu={handleOpcaoMenu}  listaPessoas={listaPessoas}  />

    }
    if(opcaoMenu === "resumoDespesa"){
        
    }
    if(opcaoMenu === "sistema"){
        return <SistemaComponent handleOpcaoMenu={handleOpcaoMenu}/>

    }
    if(opcaoMenu === "cadastraPessoas"){
        return <CadastraPessoa handleOpcaoMenu={handleOpcaoMenu} handleAtualizarListaPessoas={handleAtualizarListaPessoas}/>

    }
    return (<div>
        <h1>Pass</h1>
    
    </div>
        
    );

}

export default ControleDespesa;