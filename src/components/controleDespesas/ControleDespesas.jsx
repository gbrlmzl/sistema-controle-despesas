"use client"

import ControleDespesasMenu from "./ControleDespesasMenu";
import SistemaComponent from "./sistema/Sistema";
import { useControleDespesas } from "../../hooks/useControleDespesas";
import CadastraPessoa from "./cadastroPessoa/CadastraPessoa";
import CadastraDespesa from "./cadastraDespesa/CadastraDespesa";
import ResumoDespesas from "./resumoDespesas/ResumoDespesas";
import FormatarSistema from "./formatarSistema/FormatarSistema";
import ConsultarDespesas from "./consultarDespesas/ConsultarDespesas";
import styles from "./ControleDespesas.module.css"
function ControleDespesas() {
    const { opcaoMenu, listaPessoas, listaDespesas, handleOpcaoMenu, atualizarPessoas, atualizarDespesas, existemPessoasCadastradas } = useControleDespesas();

    const retornarAoMenu = () => {
        handleOpcaoMenu("menu");
    }

    const atualizarDadosLocais = () => {
        atualizarDespesas();
        atualizarPessoas();
    }


    if (opcaoMenu === "menu") {
        return <ControleDespesasMenu handleOpcaoMenu={handleOpcaoMenu} />
    }
    if (opcaoMenu === "consultaDespesa") {
        return (
            <div className={styles.containerPrincipal}>
                <h2>Consultar Despesas</h2>
                <ConsultarDespesas
                    listaPessoas={listaPessoas}
                    listaDespesas={listaDespesas}
                    handleOpcaoMenu={handleOpcaoMenu} />
            </div>
        )
    }
    if (opcaoMenu === "cadastraDespesa") {
        return (
            <div className={styles.containerPrincipal}>
                <h2>Cadastrar Despesas</h2>
                <CadastraDespesa
                    retornarAoMenu={retornarAoMenu}
                    handleOpcaoMenu={handleOpcaoMenu}
                    listaPessoas={listaPessoas}
                    atualizarDespesas={atualizarDespesas} />

            </div>
        )


    }
    if (opcaoMenu === "resumoDespesa") {
        return (
            <div className={styles.containerPrincipal}>
                <h2>Resumo de Despesas</h2>
                <ResumoDespesas
                    handleOpcaoMenu={handleOpcaoMenu}
                    listaDespesas={listaDespesas}
                    listaPessoas={listaPessoas} />

            </div>
        )

    }
    if (opcaoMenu === "sistema") {
        return (
            <div className={styles.containerPrincipal}>
                <h2>Sistema</h2>
                <SistemaComponent handleOpcaoMenu={handleOpcaoMenu} />
            </div>
        )


    }
    if (opcaoMenu === "cadastraPessoas") {
        return (
            <div className={styles.containerPrincipal}>
                <h2>Cadastrar Pessoas</h2>
                <CadastraPessoa
                    handleOpcaoMenu={handleOpcaoMenu}
                    atualizarPessoas={atualizarPessoas}
                    listaPessoas={listaPessoas}
                    existemPessoasCadastradas={existemPessoasCadastradas}
                />
            </div>
        )


    }
    if (opcaoMenu === "formatarSistema") {
        return (
            <div className={styles.containerPrincipal}>
                <h2>Formatar Sistema</h2>
                <FormatarSistema
                    handleOpcaoMenu={handleOpcaoMenu}
                    atualizarDadosLocais={atualizarDadosLocais}
                />
            </div>
        )

    }
    return (
        <div>
            <button onClick={retornarAoMenu}>Retornar ao menu</button>
        </div>

    );

}

export default ControleDespesas;