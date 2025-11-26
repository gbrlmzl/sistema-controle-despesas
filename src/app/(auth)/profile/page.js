import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

import Profile from './Profile';

export default async function Home() {
    const session = await auth();
    if (!session) {
        return redirect('/'); //caso o usuário esteja logado, ele é redirecionado para a página inicial.
    }
    return (
        <div className={styles.container}>
            <Profile session={session} />
        </div>
    )


}