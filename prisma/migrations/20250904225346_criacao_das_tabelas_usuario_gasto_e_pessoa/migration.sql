-- CreateTable
CREATE TABLE "public"."Usuario" (
    "idUsuario" SERIAL NOT NULL,
    "googleId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "public"."Pessoa" (
    "idPessoa" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "idUsuario" INTEGER NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("idPessoa")
);

-- CreateTable
CREATE TABLE "public"."Gasto" (
    "idGasto" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "idPessoa" INTEGER NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("idGasto")
);

-- AddForeignKey
ALTER TABLE "public"."Pessoa" ADD CONSTRAINT "Pessoa_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "public"."Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Gasto" ADD CONSTRAINT "Gasto_idPessoa_fkey" FOREIGN KEY ("idPessoa") REFERENCES "public"."Pessoa"("idPessoa") ON DELETE RESTRICT ON UPDATE CASCADE;
