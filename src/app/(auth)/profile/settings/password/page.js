import { auth } from '../../../../../auth';
import { redirect } from 'next/navigation';
import styles from './page.module.css';
import ChangePasswordForm from './ChangePasswordForm';


export default async function Home() {
    const session = await auth();
    if (!session || session.user.provider !== 'credentials') {
        return redirect('/'); //caso o usuário esteja logado, ele é redirecionado para a página inicial.
    }
    return (
        <div className={styles.container}>
            <ChangePasswordForm/>
        </div>
    )


}