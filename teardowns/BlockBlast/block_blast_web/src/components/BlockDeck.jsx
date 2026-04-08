import React from 'react';
import { useDragPhysics } from '../hooks/useDragPhysics';

/**
 * 單一方塊（包含多個小積木組合的形狀）
 */
const DraggableBlock = ({ block, onDrop }) => {
  const { shape, used, id } = block;
  const {
    dragRef,
    isDragging,
    isReturning,
    position,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  } = useDragPhysics((x, y) => onDrop(id, shape, x, y)); // 將外部的方法帶入

  if (used) {
    return <div style={{ width: '120px', height: '120px' }}></div>; // 佔位
  }

  // 繪製方塊形狀 (把 1 的地方變為實體方塊)
  const rows = shape.length;
  const cols = shape[0].length;

  return (
    <div
      ref={dragRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp} // 處理手指滑出螢幕等意外
      className={isReturning ? 'elastic-return' : ''}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 40px)`,
        gridTemplateRows: `repeat(${rows}, 40px)`,
        gap: '2px',
        cursor: 'grab',
        touchAction: 'none', // 最重要，防止手機上的滑動被瀏覽器攔截
        transform: `translate(${position.x}px, ${position.y}px) ${isDragging ? 'scale(1.1)' : 'scale(1)'}`,
        zIndex: isDragging ? 999 : 1,
      }}
    >
      {shape.map((rowArr, rIdx) =>
        rowArr.map((cell, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: cell ? '#d35400' : 'transparent',
              borderRadius: '4px',
              boxShadow: cell ? 'inset 0 1px 3px rgba(0,0,0,0.5)' : 'none',
              opacity: cell ? 1 : 0
            }}
          />
        ))
      )}
    </div>
  );
};

const BlockDeck = ({ deck, onDrop }) => {
  return (
    <div className="deck-zone">
      {deck.map((block) => (
        <div key={block.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '150px', height: '150px' }}>
          <DraggableBlock block={block} onDrop={onDrop} />
        </div>
      ))}
    </div>
  );
};

export default BlockDeck;
