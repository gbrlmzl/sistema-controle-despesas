'use client'
import Image from 'next/image';
import styles from './Inicio.module.css';
import Link from 'next/link';

export default function Inicio({ session }) {

    return (
        <div className={styles.container}>
            <div className={styles.mobileContextContainer}>
                <h1>Bem-vindo ao Cronos!</h1>
                <Image src="/assets/appImage.svg" alt="App imagem" width={320} height={215} />
                <div className={styles.description}>
                    <p>O Cronos te ajuda a organizar as despesas mensais da residência que você divide com seus colegas,
                        registrando cada despesa e determinando quanto cada residente paga e recebe. </p>
                    {session ? (
                        <div className={styles.contextContainer}>
                            <p>Comece a utilizar!</p>
                            <Link href="/app" className={styles.linkButton}>Começar</Link>
                        </div>
                    ) : (
                        <div className={styles.contextContainer}>
                            <p>Cadastre-se e comece a utilizar o Cronos!</p>
                            <Link href="/cadastro" className={styles.linkButton}>Criar conta</Link>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.desktopContextContainer}>
                <h1>Bem-vindo ao Cronos!</h1>
                <div className={styles.desktopContent}>
                    <div className={styles.descriptionContainer}>
                        <div className={styles.description}>
                            <p>O Cronos te ajuda a organizar as despesas mensais da residência que você divide com seus colegas,
                                registrando cada despesa e determinando quanto cada residente paga e recebe. </p>
                            {session ? (
                                <div className={styles.contextContainer}>
                                    <p>Comece a utilizar!</p>
                                    <Link href="/app" className={styles.linkButton}>Começar</Link>
                                </div>
                            ) : (
                                <div className={styles.contextContainer}>
                                    <p>Cadastre-se e comece a utilizar o Cronos!</p>
                                    <Link href="/cadastro" className={styles.linkButton}>Criar conta</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <Image src="/assets/appImage.svg" alt="App imagem" width={480} height={320} />

                </div>


            </div>




        </div>
    )
}