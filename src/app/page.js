import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";


export default function Home() {

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          <div>
            {/* Componente */}
          </div>
          <div style={{ backgroundColor: "lightblue", padding: 10 }}>
            <Link href="/app">Controle de Despesas</Link>
          </div>
        </div>

      </main>
      <footer className={styles.footer}>
        <p>Footer</p>
      </footer>
    </div>
  );
}
