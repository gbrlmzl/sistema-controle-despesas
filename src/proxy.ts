import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

//Rotas que só fazem sentido pra quem ainda não está logado
const ROTAS_SOMENTE_DESLOGADO = ["/login", "/cadastro"];

//Camada de autenticação: só resolve "tem sessão ou não" antes da página renderizar.
//Autorização (é membro de qual residência, é o owner, a conta é de credenciais) continua
//nas Server Actions e nas páginas — o proxy roda no Edge e não tem acesso ao Prisma.
export default auth((req: NextAuthRequest) => {
    const estaLogado = !!req.auth;
    const { pathname } = req.nextUrl;

    const precisaLogin = pathname.startsWith("/app") || pathname.startsWith("/profile");

    if (precisaLogin && !estaLogado) {
        return Response.redirect(new URL("/login", req.nextUrl));
    }

    if (ROTAS_SOMENTE_DESLOGADO.includes(pathname) && estaLogado) {
        return Response.redirect(new URL("/", req.nextUrl));
    }

    //Só contas de credenciais têm senha local pra trocar — login social não tem
    if (pathname === "/profile/settings/password" && estaLogado && req.auth?.user.provider !== "credentials") {
        return Response.redirect(new URL("/", req.nextUrl));
    }
});

export const config = {
    matcher: ["/app/:path*", "/profile/:path*", "/login", "/cadastro"],
};
