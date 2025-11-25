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

    const [atLeast8Chars, setAtLeast8Chars] = useState(false);
    const [hasNumberOrSymbol, setHasNumberOrSymbol] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    const { update } = useSession();
    const router = useRouter();


    const dadosPreenchidos = email.trim().length > 0 && password.trim().length > 0 && name.trim().length > 0 && confirmPassword.trim().length > 0;
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    }

    useEffect(() => {
        setAtLeast8Chars(password.length >= 8);
        setHasNumberOrSymbol(/[\d\W]/.test(password));
        setPasswordsMatch(password.length !== 0 && password === confirmPassword);
    }, [password, confirmPassword]);


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
                <div className={styles.errorMessage}>

                    <span className={styles.errorMessageText}>{state?.message}</span>
                </div>
            )}
            <Form action={formAction}>
                <div className={styles.formFields}>
                    <input type="text" name="name" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
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
                    <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirmar Senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className={styles.passwordConditionsContainer}>
                    <div className={styles.passwordCondition}>
                        {atLeast8Chars ? (
                            <span>
                                <img src="/icons/checkedIcon.svg" alt="Condição atendida"/>
                            </span>
                        ) : (
                            <span>
                                <img src="/icons/uncheckedIcon.svg" alt="Condição não atendida"/>
                            </span>
                        )}
                        <p>Ao menos 8 caracteres</p>
                    </div>
                    <div className={styles.passwordCondition}>
                        {hasNumberOrSymbol ? (
                            <span>
                                <img src="/icons/checkedIcon.svg" alt="Condição atendida"/>
                            </span>
                        ) : (
                            <span>
                                <img src="/icons/uncheckedIcon.svg" alt="Condição não atendida"/>
                            </span>
                        )}
                        <p>Deve conter um número ou símbolo </p>
                    </div>
                    <div className={styles.passwordCondition}>
                        {passwordsMatch ? (
                            <span>
                                <img src="/icons/checkedIcon.svg" alt="Condição atendida"/>
                            </span>
                        ) : (
                            <span>
                                <img src="/icons/uncheckedIcon.svg" alt="Condição não atendida"/>
                            </span>
                        )}
                        <p>As senhas devem coincidir</p>
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
            <Link href="/login">Já possuo uma conta</Link>
        </div>
    )
}