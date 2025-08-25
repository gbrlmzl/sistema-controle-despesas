"use client"

import ControleDespesasMenu from "./ControleDespesasMenu";
import SistemaComponent from "./Sistema";  
import {useControleDespesas} from "../hooks/useControleDespesas";
import {useCadastroPessoas} from "../hooks/useCadastroPessoas"
import CadastraPessoa from "./cadastroPessoa/CadastraPessoa";


function ControleDespesa(){
    const {opcaoMenu, handleOpcaoMenu} = useControleDespesas();
    



    
    

    if(opcaoMenu === "menu"){
        return <ControleDespesasMenu handleOpcaoMenu={handleOpcaoMenu}/>
    }
    if(opcaoMenu === "consultaDespesa"){
        //TODO ConsultaDespesa
    }
    if(opcaoMenu === "cadastraDespesa"){

    }
    if(opcaoMenu === "resumoDespesa"){
        
    }
    if(opcaoMenu === "sistema"){
        return <SistemaComponent handleOpcaoMenu={handleOpcaoMenu}/>

    }
    if(opcaoMenu === "cadastraPessoas"){
        return <CadastraPessoa handleOpcaoMenu={handleOpcaoMenu}/>

    }
    return (<div>
        <h1>Pass</h1>
    
    </div>
        
    );

}

export default ControleDespesa;