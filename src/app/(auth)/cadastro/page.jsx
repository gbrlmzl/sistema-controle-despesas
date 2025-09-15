import Link from "next/link";
import RegisterForm from "./registerForm";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";


export default async function paginaRegistro() {

    const session = await auth();
    if (session) {
        return redirect('/controledespesas'); //caso o usuário esteja logado, ele é redirecionado para o programa controle de despesas.
    }
    return(
        <div>
            <div>
                <div className="registerHeader">
                    <h2>Cadastre-se</h2>
                </div>
                <div className="registerContent">
                    <RegisterForm></RegisterForm>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
                Já possui cadastro?{' '}
                <Link className="text-gray-800 hover:underline" href="/login">
                    Faça o login
                </Link>
                .
            </p>  
        </div>
      
    )
    
}