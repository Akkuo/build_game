import os
import glob
import re

workflows_dir = r'c:\Users\akkuo\.gemini\antigravity\build_Game\.agents\workflows'

# 1. Update casual_game_teardown.md
teardown_path = os.path.join(workflows_dir, 'casual_game_teardown.md')
with open(teardown_path, 'r', encoding='utf-8') as f:
    content = f.read()
    
content = content.replace('對齊團隊的 FarmJam_規格書.xlsx 格式', '對齊團隊的 .md 與 Word 高品質規格書格式')
content = re.sub(
    r'### 7\. 轉換與交付.*',
    '### 7. 轉換與交付 (Deliverables)\\n1. 確保 01-05 的 Markdown 檔案皆已完成寫入。\\n2. 執行 python scripts/export_teardowns.py --project [專案名稱] 將數據自動產出為高品質的 Word 文件。\\n3. 在對話中通知使用者已產出。',
    content,
    flags=re.DOTALL
)
with open(teardown_path, 'w', encoding='utf-8') as f: f.write(content)

# 2. Update 01~05 MD
new_tail = '''## 📦 對齊 Markdown 工業標準產線 (Golden Layout)
完成拆解後，請將資料彙整成 Markdown 檔案，並且：
1. **[必備欄位]** 開頭必須標註 > 分析基礎： 與 > 負責人：。
2. **[視覺化]** 只要提到系統跳轉或狀態機，**強制使用 Mermaid Flowchart (graph TD)** 繪製流程圖。
3. **[硬核標籤]** 積極發掘以下技術指標，並用醒目的格式標示：
   - 物理手感偏移 (如 Y 軸防擋偏移 +150px)
   - 螢幕實體佔位 (強制 1080x2340 觀測盲點)
   - 效能與防發熱 (0 Overdraw 偽 3D、Object Pooling)
   - 動態音高多巴胺駭客 (Pitch Shifting)
   - 惡意情緒循環 (例如死局強制凍結)
'''

for file_path in glob.glob(os.path.join(workflows_dir, '0*-*.md')):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    # 尋找 "## 📦" 取代到底
    content = re.sub(r'## 📦 對齊 Excel 規格書交付.*', new_tail, content, flags=re.DOTALL)
    # 取代 Excel 開頭的特定字眼
    content = content.replace('以 Excel 記錄', '以 Markdown 表格記錄')
    
    with open(file_path, 'w', encoding='utf-8') as f: f.write(content)

print('Workflows upgraded successfully!')
