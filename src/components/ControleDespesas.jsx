"use client"

import ControleDespesasMenu from "./ControleDespesasMenu";
import SistemaComponent from "./sistema/Sistema";  
import {useControleDespesas} from "../hooks/useControleDespesas";
import CadastraPessoa from "./cadastroPessoa/CadastraPessoa";
import CadastraDespesa from "./cadastraDespesa/CadastraDespesa";
import ResumoDespesas from "./resumoDespesas/ResumoDespesas";
import FormatarSistema from "./formatarSistema/FormatarSistema";
import ConsultarDespesas from "./consultarDespesas/ConsultarDespesas";

function ControleDespesas(){
    const {opcaoMenu, listaPessoas, listaDespesas,handleOpcaoMenu, atualizarPessoas, atualizarDespesas, existemPessoasCadastradas} = useControleDespesas();

    const retornarAoMenu = () => {
        handleOpcaoMenu("menu");
    }

    const atualizarDadosLocais = () => {
        atualizarDespesas();
        atualizarPessoas();
    }
    

    if(opcaoMenu === "menu"){
        return <ControleDespesasMenu handleOpcaoMenu={handleOpcaoMenu}/>
    }
    if(opcaoMenu === "consultaDespesa"){
        return <ConsultarDespesas 
                listaPessoas={listaPessoas} 
                listaDespesas={listaDespesas} 
                handleOpcaoMenu={handleOpcaoMenu}/>
    }
    if(opcaoMenu === "cadastraDespesa"){
        return <CadastraDespesa retornarAoMenu={retornarAoMenu}
        handleOpcaoMenu={handleOpcaoMenu}  listaPessoas={listaPessoas} atualizarDespesas={atualizarDespesas}  />

    }
    if(opcaoMenu === "resumoDespesa"){
        return <ResumoDespesas handleOpcaoMenu={handleOpcaoMenu} listaDespesas={listaDespesas} listaPessoas={listaPessoas}/>
        
    }
    if(opcaoMenu === "sistema"){
        return <SistemaComponent handleOpcaoMenu={handleOpcaoMenu}/>

    }
    if(opcaoMenu === "cadastraPessoas"){
        return <CadastraPessoa
                handleOpcaoMenu={handleOpcaoMenu}
                atualizarPessoas={atualizarPessoas}
                listaPessoas={listaPessoas}
                existemPessoasCadastradas={existemPessoasCadastradas}
                />

    }
    if(opcaoMenu === "formatarSistema"){
        return <FormatarSistema 
                handleOpcaoMenu={handleOpcaoMenu}
                atualizarDadosLocais={atualizarDadosLocais}
                />
    }
    return (<div>
        <h1>Pass</h1>
    
    </div>
        
    );

}

export default ControleDespesas;