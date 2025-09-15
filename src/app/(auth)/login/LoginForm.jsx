
'use client';
import Form from "next/form";
import loginAction from "./loginAction";
import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction);
    const { update } = useSession();
    
    // Efeito para atualizar a sessão quando o login for bem-sucedido
    useEffect(() => {
        if (state?.sucess) () => {
            update(); // agora é chamado de forma segura no client
        }
    }, [state?.sucess, update]);

    return (
        <>
            {state?.sucess === false && (
                <div className="a" role="alert">
                    <strong className="aaa">Erro!</strong>
                    <span className="aa">{state?.message}</span>
                </div>
            )}
            <Form action={formAction}>
                <div>
                    <label>Email</label>
                    <input type="email" name="email" placeholder="eu@exemplo.com" />
                </div>
                <div>
                    <label>Senha</label>
                    <input type="password" name="password" placeholder="********" />
                </div>
                <div>
                    <button type="submit">
                        Login
                    </button>
                </div>
            </Form>
        </>
    )
}