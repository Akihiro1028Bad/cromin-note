-- note_opponentsテーブルのopponent_idカラムにNOT NULL制約を追加
ALTER TABLE note_opponents 
ALTER COLUMN opponent_id SET NOT NULL;

-- 制約が正しく適用されたか確認
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'note_opponents' 
AND column_name = 'opponent_id'; 