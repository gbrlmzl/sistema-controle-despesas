"use client";

import styles from "./ControleDespesasMenu.module.css";


function Menu({ handleOpcaoMenu }) {





    return (
        <div className={styles.menuContainer}>
            <div className={styles.botoesMenu}>
                <button onClick={() => handleOpcaoMenu("consultaDespesa")}>Consultar Despesas</button>
                <button onClick={() => handleOpcaoMenu("cadastraDespesa")}>Cadastrar Despesas</button>
                <button onClick={() => handleOpcaoMenu("resumoDespesa")}>Resumo de Despesas</button>
                <button onClick={() => handleOpcaoMenu("sistema")}>Sistema</button>
            </div>
        </div>
    )

}

export default Menu;