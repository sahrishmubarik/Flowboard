ALTER TABLE "card"
DROP CONSTRAINT "card_sprint_id_sprint_id_fk";

ALTER TABLE "card"
ALTER COLUMN "sprint_id" SET DATA TYPE uuid[]
USING CASE
  WHEN "sprint_id" IS NULL THEN NULL
  ELSE ARRAY["sprint_id"]
END;
