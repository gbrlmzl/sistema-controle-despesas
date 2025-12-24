"use client";
import styles from "./Navbar.module.css"
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {

  const { data: session, status } = useSession();

  const [showMobileToolbar, setShowMobileToolbar] = useState(false);
  const [showMobileUserOptions, setShowMobileUserOptions] = useState(false);

  const handleShowMobileToolbar = () => {
    setShowMobileToolbar(prev => !prev);
  }
  const handleShowMobileUserOptions = () => {
    setShowMobileUserOptions(prev => !prev);
  }

  const hideMobileToolbars = () => {
    setShowMobileToolbar(false);
    setShowMobileUserOptions(false);
  }

  if (status === "loading") {
    // enquanto carrega, renderizar um skeleton simples
    return (
      <nav className={styles.navbar}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{ width: '80px', height: 10 }} />
            <div className={styles.skeletonLine} style={{ width: '80px', height: 10 }} />
          </div>
          {/*<div className={styles.skeletonAvatar} />*/}

          <div className={styles.skeletonLine} style={{ width: '50px', height: 12 }} />
        </div>
      </nav>
    );
  }

  return (
    <nav className={styles.navbar}>
      {session ? (
        <div className={styles.linksContainer}>
          <Link href="/" className={styles.homeLink}>
            <span>
              <img src="/icons/homeIcon.svg" alt="Home" height={25} width={25} />
            </span>
          </Link>
          <div className={styles.mobileToolbar}>
            <button onClick={handleShowMobileToolbar} aria-expanded={showMobileToolbar} aria-controls="mobile-toolbar-options">
              <span>
                <img src="/icons/toolbarIcon.svg" alt="Menu" height={30} width={30} />
              </span>
            </button>
            {showMobileToolbar && (
              <div className={styles.mobileToolbarOptionsContainer} aria-hidden={!showMobileToolbar}>
                <Link href="/" className={styles.mobileToolbarLink} onClick={hideMobileToolbars}>
                  Início
                </Link>
                <Link href="/app" className={styles.mobileToolbarLink} onClick={hideMobileToolbars}>
                  Aplicativo
                </Link>
              </div>
            )}
          </div>
          <div className={styles.navTextLinks}>
            <Link href="/">Início</Link>
            <Link href="/app">Aplicativo</Link>
          </div>

          <div className={styles.userContainer}>
            <span>
              <img src={session.user.profilePic || "/icons/profileIcon.svg"} alt="Perfil" width={30} height={30} />
            </span>
            <div className={styles.userOptionsContainer}>
              <div className={styles.userInfo}>
                <p>{session.user.name}</p>
              </div>
              <div className={styles.userActions}>

                <Link href="/profile" className={styles.userActionButton}>
                  Minha conta
                </Link>
                <button onClick={() => signOut({ redirectTo: '/' })} className={styles.userActionButton}>
                  Sair
                </button>
              </div>
            </div>
          </div>

          <div className={styles.mobileUserContainer}>
            <button onClick={handleShowMobileUserOptions} aria-expanded={showMobileUserOptions} aria-controls="mobile-user-options">
              <span>
                <img src={session.user.profilePic || "/icons/profileIcon.svg"} alt="Perfil" width={30} height={30} />
              </span>
            </button>
            {showMobileUserOptions && (
              <div className={styles.mobileUserOptionsContainer}>
                <div className={styles.userInfo}>
                  <p>{session.user.name}</p>
                </div>
                <div className={styles.userActions}>
                  <Link href="/profile" className={styles.userActionButton} onClick={hideMobileToolbars}>
                    Minha conta
                  </Link>
                  <button onClick={() => { hideMobileToolbars(); signOut({ redirectTo: '/' }); }} className={styles.userActionButton}>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>




      ) : (
        <div className={styles.linksContainer}>
          <Link href="/">
            <span>
              <img src="/icons/homeIcon.svg" alt="Home" height={25} width={25} />
            </span>
          </Link>
          <div className={styles.navTextLinks}>
            <Link href="/">Início</Link>
            <Link href="/app">Aplicativo</Link>
          </div>
          <Link href="/login" className={styles.loginLink}>
            Login
          </Link>
        </div>
      )}

    </nav>
  )
}