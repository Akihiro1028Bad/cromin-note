-- note_opponentsテーブルのopponent_idカラムにNOT NULL制約を追加
-- まず、既存のnullデータを削除
DELETE FROM note_opponents 
WHERE opponent_id IS NULL;

-- NOT NULL制約を追加
ALTER TABLE note_opponents 
ALTER COLUMN opponent_id SET NOT NULL;