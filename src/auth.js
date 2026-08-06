import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { findUserByCredentials } from "./lib/user";
import db from "@/lib/prisma";
import { gerarUsernameDisponivel } from "@/lib/username";
import authConfig from "./auth.config";

import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
    ...authConfig.callbacks,
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
            //No login social o usuário não escolhe um nome de usuário, então o
            //sistema gera um a partir do email para não deixar a conta sem identificador público.
            existingUser = await db.user.create({
              data: {
                name: user.name,
                username: await gerarUsernameDisponivel(user.email.split('@')[0]),
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
            if (user.image && existingUser.profilePic === null) {
              existingUser = await db.user.update({
                where: {
                  email: user.email
                },
                data: {
                  profilePic: user.image
                }
              })

            }

            //5. Contas criadas antes da adoção do nome de usuário ficam sem identificador
            //público. Gera um na primeira vez que o usuário voltar a entrar.
            if (existingUser.username === null) {
              existingUser = await db.user.update({
                where: {
                  email: user.email
                },
                data: {
                  username: await gerarUsernameDisponivel(user.email.split('@')[0])
                }
              })
            }

          }


          //6. Prossegue com login - armazena o userId real no token
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
    async jwt(params) {
      const { token, trigger, session } = params;

      //atualiza token quando update() é chamado — só esse caminho toca o banco,
      //por isso não pode viver em auth.config.js (Edge Runtime não roda Prisma)
      if (trigger === "update") {
        if (session.updateType === "profilePicture") { // Atualização da foto de perfil
          const updatedUser = await db.user.findUnique({
            where: { email: token.email },
            select: { profilePic: true }
          });

          if (updatedUser) {
            token.profilePic = updatedUser.profilePic;
          }
        }

        return token;
      }

      return authConfig.callbacks.jwt(params);
    },
  }
});
