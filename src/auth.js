import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { findUserByCredentials } from "./lib/user";
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials({
    credentials:{
      email : {},
      password : {},
    },
    authorize: async (credentials) => {
      //procura usuarios com credenciais
      const user = await findUserByCredentials(credentials.email, credentials.password);
      
      //se não autenticado, retorna null
      //se autenticado, retorna user

      return  user;
    }
  })],
})  