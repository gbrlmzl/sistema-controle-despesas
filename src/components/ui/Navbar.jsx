"use client";
import styles from "./Navbar.module.css"
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {

    const { data: session, status } = useSession();

    if (status === "loading") {
    // enquanto carrega, renderizar um skeleton simples
    return (
      <nav className={styles.navbar}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonAvatar} />
          {/*<div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{width: '140px', height: 12}} />
            {/*<div className={styles.skeletonLine} style={{width: '80px', height: 10}} />
          </div>*/}
          {/*<div className={styles.skeletonAvatar} />*/}
          
          <div className={styles.skeletonLine} style={{width: '50px', height: 12}} />
          
          
          
        </div>
      </nav>
    );
  }

    return (
        <nav className={styles.navbar}>
            {session ? (
                <>
                    <span>Olá, {session.user.name}</span>
                    <LogoutButton />
                </>
            ) : (
                <div className={styles.linksContainer}>
                  <div>
                    <a href="/">
                      <span>
                        <img src="/icons/homeIcon.svg" alt="Home" height={25} width={25} />
                      </span>
                    </a>

                  </div>
                  <div>
                    <a href="/login">Login</a>
                  </div>

                </div>
                
            )}

        </nav>
    )
}