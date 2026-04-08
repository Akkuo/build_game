---
step: 4
agent: skill/technical-artist.md
title: 效能與美術拆解
deliverables: [遊戲介面, 遊戲美術圖, 美術風格資料]
---

# 04. 效能與美術拆解 (調用 Technical Artist)

## 🎯 拆解目的
揪出競品如何在低階手機上保持 60FPS 卻擁有華麗特效，並拆解其 UI 的操作手感與形變回饋。

## 📋 執行步驟

1. **Draw Call 與 Overdraw 推估**
   - 目測或使用工具（如 RenderDoc 等）分析粒子系統疊加層數，確認其行動版本的 Overdraw 容忍度（通常嚴控在 3 層以內）。
   - 分析 UI 圖集是否有正確合併，減少破壞批次渲染（Batching）設計。

2. **資源與 Shader 極簡化分析**
   - **拆解材質**：角色與場景是否完全無光照（Unlit），或僅使用假高光與 MatCap 以達到極致省效能。
   - **模型面數推估**：推估主角、消耗品、背景物件的最高 LOD (Triangles) 頂點預算。

3. **果凍效應與形變 (Juiciness)**
   - 拆解按鈕、彈出視窗與消除物件在互動時的 Squash & Stretch（擠壓與拉伸）彈性動畫。
   - 分析其貝茲曲線感受是 Q 彈還是生硬。

## 📦 對齊 Markdown 工業標準產線 (Golden Layout)
完成拆解後，請將資料彙整成 Markdown 檔案，並且：
1. **[必備欄位]** 開頭必須標註 > 分析基礎： 與 > 負責人：。
2. **[視覺化]** 只要提到系統跳轉或狀態機，**強制使用 Mermaid Flowchart (graph TD)** 繪製流程圖。
3. **[硬核標籤]** 積極發掘以下技術指標，並用醒目的格式標示：
   - 物理手感偏移 (如 Y 軸防擋偏移 +150px)
   - 螢幕實體佔位 (強制 1080x2340 觀測盲點)
   - 效能與防發熱 (0 Overdraw 偽 3D、Object Pooling)
   - 動態音高多巴胺駭客 (Pitch Shifting)
   - 惡意情緒循環 (例如死局強制凍結)
