-- Check how many players are unmatched and what data would be lost

-- Total unmatched players
SELECT 
  'Total unmatched players' as description,
  COUNT(*) as count
FROM players pl
WHERE pl.player_id NOT IN (SELECT scout_player_id FROM player WHERE scout_player_id IS NOT NULL);

-- Show all unmatched players with their data
SELECT 
  pl.player_id,
  pl.name,
  pl.date_of_birth,
  pl.current_team,
  pl.current_league,
  pl.current_list,
  pl.nationality,
  pl.foot,
  -- Count related data
  (SELECT COUNT(*) FROM player_ratings WHERE player_id = pl.player_id) as rating_count,
  (SELECT COUNT(*) FROM reports WHERE player_id = pl.player_id) as report_count,
  (SELECT COUNT(*) FROM verdicts WHERE player_id = pl.player_id) as verdict_count
FROM players pl
WHERE pl.player_id NOT IN (SELECT scout_player_id FROM player WHERE scout_player_id IS NOT NULL)
ORDER BY pl.name;

-- Summary of data that would be lost
SELECT 
  'Summary of unmatched player data' as description,
  COUNT(DISTINCT pl.player_id) as unmatched_players,
  COUNT(DISTINCT pr.player_id) as players_with_ratings,
  COUNT(DISTINCT r.player_id) as players_with_reports,
  COUNT(DISTINCT v.player_id) as players_with_verdicts,
  SUM(CASE WHEN pr.player_id IS NOT NULL THEN 1 ELSE 0 END) as total_ratings,
  SUM(CASE WHEN r.player_id IS NOT NULL THEN 1 ELSE 0 END) as total_reports,
  SUM(CASE WHEN v.player_id IS NOT NULL THEN 1 ELSE 0 END) as total_verdicts
FROM players pl
LEFT JOIN player_ratings pr ON pr.player_id = pl.player_id
LEFT JOIN reports r ON r.player_id = pl.player_id
LEFT JOIN verdicts v ON v.player_id = pl.player_id
WHERE pl.player_id NOT IN (SELECT scout_player_id FROM player WHERE scout_player_id IS NOT NULL);
