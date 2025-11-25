import styles from './ResumoFormatacao.module.css';



export default function ResumoFormatacao({ resultadoFormatacaoData, onRetornaAoMenu }) {



    if (resultadoFormatacaoData) {
        return (
            <div className={styles.container}>
                <div className={styles.resumoContainer}>
                    <h3>Sistema formatado com sucesso</h3>
                    <div className={styles.detalhesContainer}>
                        <ul>
                            <li>Gastos deletados: {resultadoFormatacaoData.gastosDeletados}</li>
                            <li>Pessoas deletadas: {resultadoFormatacaoData.pessoasDeletadas}</li>
                        </ul>
                    </div>

                </div>
                
                <button className='botaoTexto' onClick={onRetornaAoMenu}>Menu</button>
                    
                
            </div>
        )
    } else {
        return (
            <div>
                <div>
                    <h2>Formatar sistema</h2>
                    <p>Ocorreu um erro ao formatar o sistema. Tente novamente mais tarde.</p>

                </div>
                <div>
                    <button onClick={onRetornaAoMenu}>Retornar ao menu</button>
                </div>
            </div>


        )
    }




}