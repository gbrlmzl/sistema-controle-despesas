import Link from "next/link";
import RegisterForm from "./register-form";


export default function paginaRegistro() {
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