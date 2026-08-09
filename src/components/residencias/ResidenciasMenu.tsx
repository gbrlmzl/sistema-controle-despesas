import Link from "next/link";

import styles from "./ResidenciasMenu.module.css";

//FEAT-004 -> Menu principal do aplicativo, exibido na rota /app.
function ResidenciasMenu() {

    return (
        <div className={styles.containerPrincipal}>
            <h1>Cronos</h1>
            <div className={styles.menuContainer}>
                <div className={styles.botoesMenu}>
                    <Link href="/app/residences">Residências</Link>
                    <Link href="/app/residences/new">Criar residência</Link>
                    <Link href="/app/residences/join">Entrar em residência</Link>
                </div>
            </div>
        </div>
    )

}

export default ResidenciasMenu;
