import styles from './ExistemPessoasCadastradas.module.css';

export default function ExistemPessoasCadastradas({ retornarAoMenuPrincipal }) {
    return (
        <div className={styles.container}>
            <div className={styles.mensagemContainer}>
                <h3>Já existem pessoas cadastradas no sistema.</h3>
                <p>Para modificar as pessoas cadastradas, é necessário <span>formatar o sistema.</span></p>
            </div>

            <div className={styles.botoesContainer}>
                <button className='botaoTexto' onClick={retornarAoMenuPrincipal}>Menu</button>
            </div>
        </div>
    )
}