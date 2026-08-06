import styles from './page.module.css';

import Profile from './Profile';

//A exigência de sessão é responsabilidade do middleware (src/middleware.js).
//force-dynamic porque Profile.jsx lê a sessão via useSession() e quebraria numa
//prerenderização estática, onde não existe sessão nenhuma.
export const dynamic = 'force-dynamic';

export default function Home() {
    return (
        <div className={styles.container}>
            <Profile/>
        </div>
    )


}