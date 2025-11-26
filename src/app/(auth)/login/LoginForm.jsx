
'use client';
import Form from "next/form";
import loginAction from "./loginAction";
import { useActionState } from "react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

import styles from './LoginForm.module.css';

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction);
    const { update } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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