import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import Inicio from "./Inicio";

import { auth } from '../auth';

export default async function Home() {

  const session = await auth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Inicio session={session}/>


      </main>
      <footer className={styles.footer}>
        
      </footer>
    </div>
  );
}
