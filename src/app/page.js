import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Projetos</h1>
        <a href="/controledespesas">Controle de Despesas</a>
      </main>
      <footer className={styles.footer}>
        <p>Footer</p>
      </footer>
    </div>
  );
}
