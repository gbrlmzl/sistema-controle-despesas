import styles from "../page.module.css";
import ControleDespesas from "../../components/ControleDespesas"


export default function Home(){
    return (
    <div className={styles.page}>
        <main className={styles.main}>
            <div className="primaryCard" style={{minHeight: "50vh", minWidth : "70vw", backgroundColor: "white" }}>
                <ControleDespesas/>
            </div>
            
        </main>
        <footer className={styles.footer}>
            <h2>testando</h2>
        </footer>
    </div>

    )

    
}