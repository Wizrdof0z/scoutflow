-- Create storage bucket for player reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-reports', 'player-reports', true);

-- Set up storage policies for player reports bucket
CREATE POLICY "Allow authenticated users to upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'player-reports');

CREATE POLICY "Allow public read access to reports"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'player-reports');

CREATE POLICY "Allow authenticated users to delete their own reports"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'player-reports');
