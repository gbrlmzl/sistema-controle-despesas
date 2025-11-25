'use client'
import registerAction from "./registerAction";
import { useActionState, useEffect } from "react";
import Form from "next/form"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import styles from './RegisterForm.module.css';


export default function RegisterForm() {
    const [state, formAction, isPending] = useActionState(registerAction, null);  // Hook para gerenciar o estado da ação do formulário
    //isPending -> indica se a ação do formulário está em andamento, desabilitando o botão de envio para evitar envios múltiplos.
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { update } = useSession();
    const router = useRouter();


    const dadosPreenchidos = email.trim().length > 0 && password.trim().length > 0 && name.trim().length > 0 && confirmPassword.trim().length > 0;
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    }


    useEffect(() => {
        if (state?.success) {
            update();              // atualiza a sessão no Session Provider
            router.push("/login"); // redireciona o usuário para a página de login
        }
    }, [state?.success, router]);

    return (
        <div className={styles.container}>
            <h1>Crie sua conta</h1>
            {state?.success === false && (
                <div className="a" role="alert">
                    <strong className="aaa">Erro! </strong>
                    <span className="aa">{state?.message}</span>
                </div>
            )}
            <Form action={formAction}>
                <div className={styles.formFields}>
                    <input type="text" name="name" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
                    <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <div className={styles.passwordField}>
                        <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={togglePasswordVisibility}>
                            <span>
                                {showPassword ? (
                                    <img src="/icons/olhoIcon.svg" alt="Mostrar/Ocultar senha" />
                                ) : (
                                    <img src="/icons/olhoCortadoIcon.svg" alt="Mostrar/Ocultar senha" />)
                                }

                            </span>
                        </button>
                    </div>
                    <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirmar Senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className={styles.submitButtonContainer}>
                    <button type="submit" disabled={isPending || !dadosPreenchidos}>
                        <span>
                            <img src="/icons/avancarIcon.svg" alt="Login" />
                        </span>
                    </button>
                </div>

            </Form>
            <Link href="/login">Já possuo uma conta</Link>
        </div>
    )
}