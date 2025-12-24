
'use client';
import Form from "next/form";
import loginAction from "./loginAction";
import { useActionState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

import styles from './LoginForm.module.css';
import { sign } from "crypto";
import { set } from "zod";

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction);
    const { update } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        if (state?.success) {
            update();          // atualiza a sessão no Session Provider
            router.push("/"); // redireciona no client
        }
    }, [state?.success, router]);

    const dadosPreenchidos = email.trim().length > 0 && password.trim().length > 0;

    function togglePasswordVisibility() {
        setShowPassword(prev => !prev);
    }


    async function handleGoogleSignIn() {
        if (googleLoading) return;
        setGoogleLoading(true);

        await signIn('google');

        setGoogleLoading(false);
        // Abre uma nova janela vazia na mesma ação do clique (evita popup blocker)
        /*const popup = window.open('/api/auth/signin?provider=google', '_blank', 'noopener,noreferrer');

        // fallback de segurança (caso o popup feche)
        const timer = setInterval(() => {
            if (!popup || popup.closed) {
                clearInterval(timer);
                setGoogleLoading(false);
            }
        }, 500);*/
    };




    return (
        <div className={styles.container}>
            <h1>Fazer login</h1>
            {state?.success === false && (
                <div className={styles.errorMessage}>
                    <span className="aa">{state?.message}</span>
                </div>

            )}

            <Form action={formAction}>
                <div className={styles.formFields}>
                    <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <div className={styles.passwordField}>
                        <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <span className={styles.passwordToggle} onClick={togglePasswordVisibility}>
                            {showPassword ? (
                                <img src="/icons/olhoIcon.svg" alt="Mostrar/Ocultar senha" />
                            ) : (
                                <img src="/icons/olhoCortadoIcon.svg" alt="Mostrar/Ocultar senha" />)
                            }

                        </span>
                    </div>
                </div>
                <div className={styles.socialMediaLoginContainer}>
                    <div className={styles.socialMediaLogin}>
                        <button type="button" onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            aria-busy={googleLoading}
                            aria-disabled={googleLoading}>
                            <span>
                                <img src="/icons/googleIcon.svg" alt="Login com Google" />
                            </span>
                        </button>
                    </div>

                </div>

                <div className={styles.submitButtonContainer}>
                    <button type="submit" disabled={isPending || !dadosPreenchidos}>
                        <span>
                            <img src="/icons/avancarIcon.svg" alt="Login" />
                        </span>
                    </button>
                </div>
            </Form>
            <Link href="/cadastro">
                Criar conta
            </Link>
        </div>
    )
}