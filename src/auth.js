import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { findUserByCredentials } from "./lib/user";
import db from "@/lib/prisma";

import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        //procura usuarios com credenciais
        const user = await findUserByCredentials(credentials.email, credentials.password);
        

        //se não autenticado, retorna null
        //se autenticado, retorna user

        return user;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // 1. Verifica se existe usuário com esse email
          let existingUser = await db.user.findUnique({
            where: { email: user.email },
            include: { authProviders: true }
          });

          if (!existingUser) {
            // 2. Se não existe, cria novo usuário
            existingUser = await db.user.create({
              data: {
                name: user.name,
                email: user.email,
                password: null,
                profilePic: user.image,
                authProviders: {
                  create: {
                    provider: 'google',
                    providerId: account.providerAccountId,
                  }
                }
              }
            });
          } else {
            // 3. Usuário existe - verificar se já tem provider Google
            const hasGoogleProvider = existingUser.authProviders.some(
              p => p.provider === 'google' && p.providerId === account.providerAccountId
            );

            if (!hasGoogleProvider) {
              // Adiciona o provider Google ao usuário existente
              await db.userAuthProvider.create({
                data: {
                  userId: existingUser.id,
                  provider: 'google',
                  providerId: account.providerAccountId,
                }
              });
            }
            //4. Verificar se o usuario possui uma foto de perfil
            if(user.image && existingUser.profilePic === null){
              existingUser = await db.user.update({
                where: {email: user.email
                },
                data: {profilePic: user.image
                }
              })

            }

          }

        
          //5. Prossegue com login - armazena o userId real no token
          user.dbId = existingUser.id;
          user.profilePic = existingUser.profilePic;
          user.provider = 'google';
          
          return true;
        } catch (error) {
          console.error('Erro no signIn Google:', error);
          return false; // bloqueia login se houver erro
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Armazena o ID do banco no token JWT
      if (user?.dbId) {
        token.dbId = user.dbId;
        token.profilePic = user.profilePic;
        token.provider = user.provider;
      } else if (user?.id && account?.provider === 'credentials') {
        // Para login com credenciais, user.id já é o ID do banco
        token.dbId = user.id;
        token.profilePic = user.profilePic || null;
        token.provider = 'credentials';
      }
      // Se user não existir (chamadas subsequentes), mantém os valores do token

      return token;
    },
    async session({ session, token }) {
      // Passa o ID do banco para a sessão do cliente
      if (token.dbId) {
        session.user.id = token.dbId;
        session.user.profilePic = token.profilePic || null;
        session.user.provider = token.provider || null;
      }
      

      return session;
    }
  }
});