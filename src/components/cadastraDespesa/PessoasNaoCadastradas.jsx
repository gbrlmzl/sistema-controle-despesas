import styles from "./PessoasNaoCadastradas.module.css";


export default function PessoasNaoCadastradas({onCadastraPessoas, onRetornaAoMenu}) {




    return (
        <div className={styles.container}>
            <div className={styles.mensagemContainer}>
                <p>Você precisa cadastrar pessoas antes de cadastrar despesas.</p>

            </div>
            <div className="botoesContainer" >
                <button className="botaoTexto" onClick={onCadastraPessoas}>Cadastrar Pessoas</button>
                <button className="botaoTexto" onClick={onRetornaAoMenu}>Menu</button>
            </div>
        </div>
    )
}