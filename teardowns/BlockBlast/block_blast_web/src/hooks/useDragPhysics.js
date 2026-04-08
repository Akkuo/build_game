import { useState, useRef, useEffect } from 'react';

/**
 * 處理懸浮拖曳手感的自訂 Hook
 * 負責 +150px 往上提起的視線防擋，以及彈性退回邏輯。
 */
export function useDragPhysics(onDrop) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isReturning, setIsReturning] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null);

  // Y軸偏移常量：手指按住時，實體模型無條件向上方飄 150px
  const Y_OFFSET = -150; 

  const handlePointerDown = (e) => {
    // 鎖定滑鼠/手指
    if(dragRef.current) dragRef.current.setPointerCapture(e.pointerId);
    
    setIsDragging(true);
    setIsReturning(false);
    startPos.current = { x: e.clientX, y: e.clientY };
    // 起始位置包含強制向上漂浮
    setPosition({ x: 0, y: Y_OFFSET });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    // 動態取得目前的縮放比例，解決 transform: scale 後拖曳速度變慢的問題
    const rootEl = document.getElementById('root');
    const scale = rootEl ? (rootEl.getBoundingClientRect().width / 1080) : 1;

    const deltaX = (e.clientX - startPos.current.x) / scale;
    const deltaY = (e.clientY - startPos.current.y) / scale;
    
    // 即時計算偏移 (保持偏移量)
    setPosition({ x: deltaX, y: deltaY + Y_OFFSET });
  };

  const handlePointerUp = (e) => {
    if(dragRef.current) dragRef.current.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    // 觸發外部 Drop 邏輯
    const success = onDrop(e.clientX, e.clientY);
    
    // 若沒有成功放下，則啟動退回動畫
    if (!success) {
      setIsReturning(true);
      setPosition({ x: 0, y: 0 });
      // 0.3s 後重置狀態，這與 CSS 的彈力動畫時間匹配
      setTimeout(() => {
        setIsReturning(false);
      }, 300);
    }
  };

  return {
    dragRef,
    isDragging,
    isReturning,
    position,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
