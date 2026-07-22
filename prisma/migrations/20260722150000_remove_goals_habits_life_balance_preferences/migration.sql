-- Remove modules: metas, habitos, roda da vida (life balance + mood), preferencias

DROP TABLE IF EXISTS "HabitLog";
DROP TABLE IF EXISTS "Habit";
DROP TABLE IF EXISTS "Goal";
DROP TABLE IF EXISTS "MoodLog";
DROP TABLE IF EXISTS "LifeBalance";
DROP TABLE IF EXISTS "UserPreferences";

DROP TYPE IF EXISTS "GoalCategory";
DROP TYPE IF EXISTS "GoalStatus";
DROP TYPE IF EXISTS "Priority";