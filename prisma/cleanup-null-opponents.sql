-- note_opponentsテーブルからopponent_idがnullのレコードを削除
DELETE FROM note_opponents 
WHERE opponent_id IS NULL;

-- 削除されたレコード数を確認
SELECT COUNT(*) as deleted_count 
FROM note_opponents 
WHERE opponent_id IS NULL; 