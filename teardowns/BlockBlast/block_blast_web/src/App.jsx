import React, { useState, useEffect } from 'react';
import './App.css';
import GridBoard from './components/GridBoard';
import BlockDeck from './components/BlockDeck';
import { getRandomShape } from './utils/shapes';

const GRID_SIZE = 8;
const CELL_SIZE = 120; // grid cell width + margin (110+5+5) roughly, but we can measure offset differently. 
// For simplicity, we assume absolute grid mapping later.

function App() {
  const [grid, setGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill(null));
  const [score, setScore] = useState(0);
  
  // 底部配發的 3 個方塊
  const [deck, setDeck] = useState([]);

  // 初始化給 3 個方塊
  useEffect(() => {
    refillDeck();
  }, []);

  const refillDeck = () => {
    setDeck([
      { id: Date.now() + 1, shape: getRandomShape(), used: false },
      { id: Date.now() + 2, shape: getRandomShape(), used: false },
      { id: Date.now() + 3, shape: getRandomShape(), used: false },
    ]);
  };

  // 嘗試放置方塊
  // clientX, clientY 為鬆手時的手指座標
  const handleDrop = (blockId, shape, clientX, clientY) => {
    // 這裡我們要做一個簡化的矩陣碰撞測試
    // 在真實環境中，需要透過 getBoundingClientRect() 來尋找剛好被覆蓋的 GridCell
    const boardElement = document.getElementById('grid-board');
    if (!boardElement) return false;

    const rect = boardElement.getBoundingClientRect();
    
    // 如果手指放下的位置不在 Board 內，直接退回
    if (
      clientX < rect.left || clientX > rect.right ||
      clientY < rect.top || clientY > rect.bottom
    ) {
      return false; // 非法，退回
    }

    // 計算落點對應的 col, row (基於左上角的 grid)
    // 這裡需要根據 Y_OFFSET 來做微調，但手指位置就是方塊正中心（或左上角）
    // 為了簡化，我們假設 clientX, Y 是方塊左上角
    const colRaw = Math.floor((clientX - rect.left) / 120);
    const rowRaw = Math.floor((clientY - rect.top) / 120);

    // 碰撞邊界檢查
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    if (rowRaw < 0 || colRaw < 0 || rowRaw + shapeRows > GRID_SIZE || colRaw + shapeCols > GRID_SIZE) {
      return false; // 超出邊界
    }

    // 檢查覆蓋的目標底層是否已經有方塊
    let canPlace = true;
    for (let r = 0; r < shapeRows; r++) {
      for (let c = 0; c < shapeCols; c++) {
        if (shape[r][c] === 1) {
          const gridIndex = (rowRaw + r) * GRID_SIZE + (colRaw + c);
          if (grid[gridIndex] !== null) {
            canPlace = false;
            break;
          }
        }
      }
      if (!canPlace) break;
    }

    if (!canPlace) return false;

    // 可以放下，更新 Grid 狀態
    const newGrid = [...grid];
    for (let r = 0; r < shapeRows; r++) {
      for (let c = 0; c < shapeCols; c++) {
        if (shape[r][c] === 1) {
          const gridIndex = (rowRaw + r) * GRID_SIZE + (colRaw + c);
          newGrid[gridIndex] = 1; // 1 代表有東西
        }
      }
    }
    setGrid(newGrid);

    // 更新 Deck 狀態
    const newDeck = deck.map(b => b.id === blockId ? { ...b, used: true } : b);
    setDeck(newDeck);

    // 檢查是否三個都用完了
    if (newDeck.every(b => b.used)) {
      setTimeout(() => refillDeck(), 300);
    }

    // 處理滿行/滿列消除邏輯 (Ripple Effect 等留待進階)
    checkClears(newGrid);

    return true; // 成功放下
  };

  const checkClears = (currentGrid) => {
    let rowsToClear = [];
    let colsToClear = [];

    // 檢查 Rows
    for (let r = 0; r < GRID_SIZE; r++) {
      let isFull = true;
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r * GRID_SIZE + c] === null) {
          isFull = false;
          break;
        }
      }
      if (isFull) rowsToClear.push(r);
    }

    // 檢查 Cols
    for (let c = 0; c < GRID_SIZE; c++) {
      let isFull = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (currentGrid[r * GRID_SIZE + c] === null) {
          isFull = false;
          break;
        }
      }
      if (isFull) colsToClear.push(c);
    }

    if (rowsToClear.length > 0 || colsToClear.length > 0) {
      let nextGrid = [...currentGrid];
      let scoreAdd = (rowsToClear.length + colsToClear.length) * 100;
      
      rowsToClear.forEach(r => {
        for(let c=0; c<GRID_SIZE; c++) nextGrid[r * GRID_SIZE + c] = null;
      });
      colsToClear.forEach(c => {
        for(let r=0; r<GRID_SIZE; r++) nextGrid[r * GRID_SIZE + c] = null;
      });

      setGrid(nextGrid);
      setScore(s => s + scoreAdd);
      
      // 在這裡可以接音效：crash_pop.wav
    }
  };

  return (
    <div className="app-container">
      <div className="score-board">{score}</div>
      <GridBoard grid={grid} />
      <BlockDeck deck={deck} onDrop={handleDrop} />
    </div>
  );
}

export default App;
