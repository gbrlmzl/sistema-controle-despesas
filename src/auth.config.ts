import type { NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Account } from "@auth/core/types";

//Config "segura para o Edge Runtime": nenhum import daqui pode tocar o Prisma
//(APIs Node-only como sockets TCP e node:crypto quebram no Edge). É a base que o
//proxy usa para só decodificar a sessão já existente — a autenticação de
//verdade (Credentials com Prisma, criação de usuário no login Google) mora só em
//./auth.ts, que roda em runtime Node.
export default {
    providers: [],
    callbacks: {
        async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }) {
            if (user?.dbId) {
                token.dbId = user.dbId;
                token.profilePic = user.profilePic;
                token.provider = user.provider;
            } else if (user?.id && account?.provider === 'credentials') {
                //Para login com credenciais, user.id já é o ID do banco
                token.dbId = user.id;
                token.profilePic = user.profilePic || null;
                token.provider = 'credentials';
            }
            //Se user não existir (chamadas subsequentes), mantém os valores do token

            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token.dbId) {
                session.user.id = token.dbId;
                session.user.profilePic = token.profilePic || null;
                session.user.provider = token.provider || null;
            }

            return session;
        },
    },
} satisfies NextAuthConfig;
