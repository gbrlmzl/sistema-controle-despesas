import styles from './page.module.css';
import ChangePasswordForm from './ChangePasswordForm';

//A exigência de sessão + conta de credenciais é responsabilidade do middleware (src/middleware.js)
export default function Home() {
    return (
        <div className={styles.container}>
            <ChangePasswordForm/>
        </div>
    )


}