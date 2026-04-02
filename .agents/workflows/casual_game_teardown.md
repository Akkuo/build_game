---
description: 執行休閒遊戲的自動化逆向拆解與規格轉換
---

# 🎮 休閒遊戲自動化拆解工作流 (Casual Game Teardown Workflow)

本工作流旨在將標的休閒遊戲（如混合解謎、挪車、合成），以結構化的方式，依序呼叫專案內的五大 AI 專家 Agent，最終將分析數據自動產出並對齊團隊的 `FarmJam_規格書.xlsx` 格式。

## 起始條件
- 使用者提供欲拆解的競品名稱（或提供相關影片、截圖、遊玩錄影）。
- 確認已啟用/調用 `build_Game` 目錄下的各 Agent 設定檔。

## 執行步驟

### 1. 啟動與初步勘查
1. 建立專屬的分析任務文件（例如：`/tmp/xxx_teardown_raw.md`），用於記錄中繼資料。
2. 讓使用者簡單提供該遊戲的核心玩法描述或應用程式商店連結。

### 2. 系統與經濟拆解 (調用 Game Designer)
**指令**：請套用 `game-designer.md` 人格，執行 `teardown-plan.md` 第一階段任務。
- 分析即時循環（輸入/輸出映射）與單次行動獎勵。
- 建立前 20 關或前 60 分鐘的數值/經濟消耗動線。
- 擷取廣告/內購 (IAP) 彈跳的心理卡點。
- 將結果整理儲存，預備寫入規格書的 **`遊戲規則`**、**`流程圖`** 與 **`道具功能`** 分頁。

### 3. 關卡與空間分析 (調用 Level Designer)
**指令**：請套用 `level-designer.md` 人格，執行 `teardown-plan.md` 第二階段任務。
- 繪製關卡節奏光譜（教導 -> 應用 -> 爽快 -> 付費卡關）。
- 拆解空間盤面與動線防呆機制。
- 將結果整理儲存，預備寫入規格書的 **`關卡資料`** 分頁。

### 4. 效能與美術拆解 (調用 Technical Artist)
**指令**：請套用 `technical-artist.md` 人格，執行 `teardown-plan.md` 第四階段任務。
- 推估 Draw Call、Overdraw 層數與渲染上限。
- 拆解 UI/UX 熱區與 Squash & Stretch 形變反饋風格。
- 將結果整理儲存，預備寫入規格書的 **`遊戲介面`** 與 **`美術風格資料`** 分頁。

### 5. 聽覺反饋擷取 (調用 Audio Engineer)
**指令**：請套用 `game-audio-engineer.md` 人格，執行 `teardown-plan.md` 第三階段任務。
- 分析動態音高、連擊（Combo）的 ASMR 回饋機制。
- 推估記憶體預算與音訊數量。
- 將結果整理儲存，預備寫入規格書的 **`音樂音效需求`** 分頁。

### 6. 主題與敘事包裝 (調用 Narrative Designer)
**指令**：請套用 `narrative-designer.md` 人格，執行 `teardown-plan.md` 第五階段任務。
- 分析廣告素材與實際遊戲的 Meta 故事連接（如家裝、拯救元素）。
- 將結果整理儲存，預備寫入規格書的 **`主題包裝`** 分頁。

### 7. 轉換與交付 (Deliverable Generation)
1. 核對 `teardown-deliverables-spec.md` 的所有欄位是否已完成。
2. 產出最終的成果物摘要給使用者。
3. 若需自動化，可利用 Python (搭配 `openpyxl`) 將上列中繼數據，直接填寫入 `FarmJam_規格書.xlsx` 對應的 Sheet 中。
