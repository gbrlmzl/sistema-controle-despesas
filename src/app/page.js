import Image from "next/image";
import styles from "./page.module.css";


export default function Home() {

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Projetos</h1>
        <a href="/controledespesas">Controle de Despesas</a>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1vh"}}>
          <div style={{ borderRadius: 400, overflow: "hidden", border: "5px solid", borderColor: "lightgreen", background: "lightgray", maxWidth: "300px" }}>
            <Image
              src={"/fotoPerfil.svg"}
              alt="Gabriel Mizael"
              width={300}
              height={300}
            />
          </div>
          <h2>Gabriel Mizael de Sousa Gomes</h2>

        </div>

      </main>
      <footer className={styles.footer}>
        <p>Footer</p>
      </footer>
    </div>
  );
}
