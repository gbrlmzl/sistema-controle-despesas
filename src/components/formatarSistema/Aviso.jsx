import styles from './Aviso.module.css';

export default function Aviso({ handleProsseguir }) {
    return (
        <div className={styles.container}>
            <div className={styles.avisoContainer}> 
                <h3>ATENÇÃO!</h3>
                <div className={styles.mensagemContainer}>
                    <p>Esta ação irá apagar todos os dados do sistema, <span className={styles.destaque}>incluindo pessoas e despesas cadastradas</span></p>
                </div>
                <span className={styles.continuarTexto}><p>Deseja continuar?</p></span>

            </div>

            <div className='botoesContainer'>
                <button className='botaoTexto' onClick={() => handleProsseguir(false)}>Cancelar</button>
                <button className='botaoTexto' onClick={() => handleProsseguir(true)}>Prosseguir</button>
            </div>

        </div>
    )
}