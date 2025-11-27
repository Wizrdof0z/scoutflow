-- Create position-specific views from physical_p90 data
-- Each view aggregates players by their normalized position group

-- Drop existing player table (will be replaced by views)
DROP TABLE IF EXISTS player CASCADE;

-- Function to calculate age from birthdate
CREATE OR REPLACE FUNCTION calculate_age(birthdate DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- LEFT BACK VIEW (LB, LWB → LB)
-- ============================================================================
CREATE OR REPLACE VIEW vw_lb_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'LB' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position IN ('LB', 'LWB')
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- RIGHT BACK VIEW (RB, RWB → RB)
-- ============================================================================
CREATE OR REPLACE VIEW vw_rb_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'RB' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position IN ('RB', 'RWB')
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- CENTER BACK VIEW (LCB, RCB, CB → CB)
-- ============================================================================
CREATE OR REPLACE VIEW vw_cb_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'CB' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position IN ('LCB', 'RCB', 'CB')
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- DEFENSIVE MIDFIELDER VIEW (LDM, RDM, DM → DM)
-- ============================================================================
CREATE OR REPLACE VIEW vw_dm_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'DM' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position IN ('LDM', 'RDM', 'DM')
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- CENTRAL MIDFIELDER VIEW (LCM, RCM, RM, LM, CM → CM)
-- ============================================================================
CREATE OR REPLACE VIEW vw_cm_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'CM' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position IN ('LCM', 'RCM', 'RM', 'LM', 'CM')
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- ATTACKING MIDFIELDER VIEW (LAM, RAM, AM → AM)
-- ============================================================================
CREATE OR REPLACE VIEW vw_am_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'AM' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position IN ('LAM', 'RAM', 'AM')
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- RIGHT WINGER VIEW (RW → RW)
-- ============================================================================
CREATE OR REPLACE VIEW vw_rw_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'RW' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position = 'RW'
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- LEFT WINGER VIEW (LW → LW)
-- ============================================================================
CREATE OR REPLACE VIEW vw_lw_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'LW' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position = 'LW'
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- CENTER FORWARD VIEW (RF, LF, CF → CF)
-- ============================================================================
CREATE OR REPLACE VIEW vw_cf_player AS
SELECT 
  competition_edition_id,
  MAX(competition_name) as competition_name,
  'CF' as position,
  MAX(position_group) as position_group,
  player_id,
  MAX(player_name) as player_name,
  MAX(player_short_name) as player_short_name,
  MAX(player_birthdate) as player_birthdate,
  calculate_age(MAX(player_birthdate)) as age,
  team_id,
  MAX(team_name) as team_name,
  season_id,
  MAX(season_name) as season_name,
  SUM(count_match) as count_match
FROM physical_p90
WHERE position IN ('RF', 'LF', 'CF')
GROUP BY player_id, competition_edition_id, team_id, season_id;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count players in each position view
SELECT 'LB' as position, COUNT(*) as player_count FROM vw_lb_player
UNION ALL
SELECT 'RB', COUNT(*) FROM vw_rb_player
UNION ALL
SELECT 'CB', COUNT(*) FROM vw_cb_player
UNION ALL
SELECT 'DM', COUNT(*) FROM vw_dm_player
UNION ALL
SELECT 'CM', COUNT(*) FROM vw_cm_player
UNION ALL
SELECT 'AM', COUNT(*) FROM vw_am_player
UNION ALL
SELECT 'RW', COUNT(*) FROM vw_rw_player
UNION ALL
SELECT 'LW', COUNT(*) FROM vw_lw_player
UNION ALL
SELECT 'CF', COUNT(*) FROM vw_cf_player
ORDER BY position;

-- Sample from each view
SELECT 'LB' as view_name, player_name, team_name, season_name, count_match FROM vw_lb_player LIMIT 3;
SELECT 'RB' as view_name, player_name, team_name, season_name, count_match FROM vw_rb_player LIMIT 3;
SELECT 'CB' as view_name, player_name, team_name, season_name, count_match FROM vw_cb_player LIMIT 3;
SELECT 'DM' as view_name, player_name, team_name, season_name, count_match FROM vw_dm_player LIMIT 3;
SELECT 'CM' as view_name, player_name, team_name, season_name, count_match FROM vw_cm_player LIMIT 3;
SELECT 'AM' as view_name, player_name, team_name, season_name, count_match FROM vw_am_player LIMIT 3;
SELECT 'RW' as view_name, player_name, team_name, season_name, count_match FROM vw_rw_player LIMIT 3;
SELECT 'LW' as view_name, player_name, team_name, season_name, count_match FROM vw_lw_player LIMIT 3;
SELECT 'CF' as view_name, player_name, team_name, season_name, count_match FROM vw_cf_player LIMIT 3;
