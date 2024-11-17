-- AlterTable
CREATE SEQUENCE "pwa".tests_id_seq;
ALTER TABLE "pwa"."Tests" ALTER COLUMN "id" SET DEFAULT nextval('"pwa".tests_id_seq');
ALTER SEQUENCE "pwa".tests_id_seq OWNED BY "pwa"."Tests"."id";
