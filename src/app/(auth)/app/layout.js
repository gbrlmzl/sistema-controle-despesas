import "./app.css";

//A exigência de sessão pra tudo em /app/** é responsabilidade do middleware
//(src/middleware.js) — ele roda antes desta página renderizar.
export default function ControleDespesasLayout({ children }) {
    return (
        <div className="paginaConteudo">
            <main>
                {children}
            </main>
            <footer>
                <a href="https://github.com/gbrlmzl" target="_blank" rel="noopener noreferrer" style={{fontFamily: "var(--font-roboto-condensed)"}}>github.com/gbrlmzl</a>
            </footer>
        </div>
    );
}