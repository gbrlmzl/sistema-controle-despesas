-- AlterTable
CREATE SEQUENCE "public".pessoa_id_seq;
ALTER TABLE "public"."Pessoa" ALTER COLUMN "id" SET DEFAULT nextval('"public".pessoa_id_seq');
ALTER SEQUENCE "public".pessoa_id_seq OWNED BY "public"."Pessoa"."id";
