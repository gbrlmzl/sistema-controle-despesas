import styles from "../page.module.css";
import ControleDespesas from "../../components/ControleDespesa"


export default function Home(){
    return (
    <div className={styles.page}>
        <main className={styles.main}>
            <div className="primaryCard" style={{minHeight: "50vh", minWidth : "70vw", backgroundColor: "white" }}>
                <ControleDespesas/>
            </div>
            
        </main>
        <footer className={styles.footer}>
            <a href="https://www.google.com">Pênis de Cavalo</a>
        </footer>
    </div>

    )

    
}