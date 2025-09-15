import Link from 'next/link';
import LoginForm from './LoginForm';
import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();
  if(session){
    return redirect('/'); //caso o usuário esteja logado, ele é redirecionado para a página inicial.
  }

  return (
    <>
      <div>
        <div>
          <h2>Boas Vindas</h2>
          <h3>Faça seu login com email e senha.</h3>
        </div>
        <div>
            <LoginForm></LoginForm>

        </div>
      </div>
      <p>
        Não possui cadastro?{' '}
        <Link  href="/cadastro">
          Registre-se
        </Link>
        .
      </p>
    </>
  );
}