
'use client';
import Form from "next/form";
import loginAction from "./loginAction";
import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction);
    const { update } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (state?.success) {
            update();          // atualiza a sessão no Session Provider
            router.push("/"); // redireciona no client
        }
    }, [state?.success, router]);

    return (
        <>
            {state?.success === false && (
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
                    <button type="submit" disabled={isPending}>
                        Login
                    </button>
                </div>
            </Form>
        </>
    )
}