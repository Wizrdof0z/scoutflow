-- Drop SkillCorner tables in reverse order (due to foreign key dependencies)
DROP TABLE IF EXISTS player CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS competition_editions CASCADE;
