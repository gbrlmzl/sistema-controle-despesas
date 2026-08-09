//O `export {}` é necessário: sem nenhum import/export no topo, este arquivo seria
//tratado como script global, e todo `declare module "x" {}` abaixo REDECLARARIA o
//módulo (apagando o original) em vez de só aumentá-lo (merge).
export {};

//session.user/token/user carregam campos que este projeto adiciona nos callbacks
//jwt/session (src/auth.config.ts) e que não existem no tipo padrão do NextAuth.
//
//A augmentation vai em "@auth/core/types"/"@auth/core/jwt" (e não "next-auth"/
//"next-auth/jwt"): next-auth/index.d.ts só faz `export type { User, Session, ... }
//from "@auth/core/types"` — um re-export de tipo, não uma declaração própria — e é
//em "@auth/core" que as funções da lib (callbacks.session, callbacks.jwt) realmente
//buscam esses tipos para os parâmetros.
declare module "@auth/core/types" {
    interface User {
        dbId?: number;
        profilePic?: string | null;
        provider?: "credentials" | "google";
    }

    interface Session {
        //Omit precisa cobrir os 3 campos redeclarados abaixo, não só "id": interseção
        //(&) restringe em vez de sobrescrever, então manter "provider" no Omit faria
        //("credentials"|"google"|undefined) & ("credentials"|"google"|null) colapsar
        //pra "credentials"|"google" (null e undefined não se sobrepõem e somem).
        user: Omit<User, "id" | "profilePic" | "provider"> & {
            id?: number | string;
            profilePic: string | null;
            provider: "credentials" | "google" | null;
        };
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        dbId?: number | string;
        profilePic?: string | null;
        provider?: "credentials" | "google";
    }
}
