'use server';
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import "./app.css";


export default async function ControleDespesasLayout({ children }) {
    const session = await auth();
    if (!session) {
        redirect("/login"); // Se o usuário não estiver autenticado, redireciona para a página de login
    }

    return (
        <div className="paginaConteudo" style={{ }}>
            <header className="tituloPrincipal">
                <span>
                    <a href="/app">Controle de Despesas</a>
                </span>
            </header>
            <main>
                {children}
            </main>
            <footer>
                <small>Instagram - gbrlmzl</small>
            </footer>
        </div>
    );
}