"use client"

import styles from './Sistema.module.css'

function Sistema({ handleOpcaoMenu }) {


    return (
        <div className={styles.container}>
            <div className={styles.botaoSistemaContainer}>
                <button className="botaoTexto" onClick={() => handleOpcaoMenu("cadastraPessoas")}>Cadastrar Pessoas</button>
                <button className={styles.botaoFormatar} onClick={() => handleOpcaoMenu("formatarSistema")}>Formatar sistema</button>
            </div>
            <div className={styles.botaoMenuContainer}>
                <button className='botaoTexto' onClick={() => handleOpcaoMenu("menu")}> Menu</button>
            </div>
        </div>
        
    )

}


export default Sistema;