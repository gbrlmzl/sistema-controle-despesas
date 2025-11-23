import styles from './SobrescreveDespesa.module.css';

export default function SobrescreveDespesa({onConfirmaSobrescrever, onCancela, mesAnoTexto}) {
    return(
        <div className={styles.container}>
            <div className={styles.mensagemContainer}>
                <p>Existem despesas cadastradas para {mesAnoTexto}.</p>
                <p className={styles.mensagemSobrescrever}>Deseja sobrescrevê-las?</p>
            </div>
            
            
            

            <div className="botoesContainer">
                <button className="botaoTexto" onClick={onCancela}>Cancelar</button>
                <button className="botaoTexto" onClick={onConfirmaSobrescrever}>Sobrescrever</button> 
            </div>
        </div>
    )
}