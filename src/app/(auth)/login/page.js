import LoginForm from './LoginForm';
import styles from './page.module.css';

//Quem já está logado é redirecionado antes de chegar aqui pelo middleware (src/middleware.js)
export default function LoginPage() {
  return (
    <div className={styles.container}>
      <LoginForm />  
    </div>
        
  );
}