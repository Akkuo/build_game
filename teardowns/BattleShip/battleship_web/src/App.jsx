import { useState, useEffect, useRef } from 'react'
import './App.css'

const GRID_SIZE = 100;
const SHIP_TYPES = [
  { id: 'carrier', name: '航空母艦(5)', size: 5 },
  { id: 'battleship1', name: '戰艦(4)', size: 4 },
  { id: 'battleship2', name: '戰艦(4)', size: 4 },
  { id: 'destroyer1', name: '驅逐(3)', size: 3 },
  { id: 'destroyer2', name: '驅逐(3)', size: 3 },
  { id: 'submarine', name: '潛艦(3)', size: 3 },
  { id: 'patrol1', name: '巡邏(2)', size: 2 },
  { id: 'patrol2', name: '巡邏(2)', size: 2 }
];

// Audio Dopamine Engine (ASMR 神經駭客模組)
let audioCtx;
function initAudio() {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playAudio(type, combo = 0) {
  if(!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  if(type === 'hit') {
      // 連擊越高，音調越高 (Pitch Shift +50Hz per combo)
      osc.type = 'square';
      osc.frequency.setValueAtTime(300 + (combo * 50), now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
  } else if (type === 'miss') {
      // 落空的沮喪低音 (Bass Drop)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
  } else if (type === 'sunk') {
      // 擊沉的震撼高歌
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
  }
}

// 隨機佈陣演算法 (防重疊、防越界)
function generateFleet() {
  const board = Array(GRID_SIZE).fill(null);
  const shipsMap = {}; 
  
  for (let ship of SHIP_TYPES) {
    let placed = false;
    while (!placed) {
      let isVertical = Math.random() > 0.5;
      let startX = Math.floor(Math.random() * 10);
      let startY = Math.floor(Math.random() * 10);
      
      let indices = [];
      let canPlace = true;
      for (let i = 0; i < ship.size; i++) {
        let x = startX + (isVertical ? 0 : i);
        let y = startY + (isVertical ? i : 0);
        
        if (x > 9 || y > 9) { canPlace = false; break; } // Out of bounds
        
        let idx = y * 10 + x;
        if (board[idx] !== null) { canPlace = false; break; } // Collision
        indices.push(idx);
      }
      
      if (canPlace) {
        for(let idx of indices) { board[idx] = ship.id; }
        shipsMap[ship.id] = { ...ship, hitCount: 0, indices, isSunk: false };
        placed = true;
      }
    }
  }
  return { board, shipsMap };
}

function App() {
  const [playerData, setPlayerData] = useState(null);
  const [enemyData, setEnemyData] = useState(null);
  
  // Hit Tracking Arrays: null -> unrevealed, 'miss' -> missed, specific_ship_id -> hit
  const [playerGridReveal, setPlayerGridReveal] = useState(Array(GRID_SIZE).fill(null));
  const [enemyGridReveal, setEnemyGridReveal] = useState(Array(GRID_SIZE).fill(null));
  
  const [turn, setTurn] = useState('player'); // 'player' | 'enemy'
  const [combo, setCombo] = useState(0);
  const [logs, setLogs] = useState([]);
  const [winner, setWinner] = useState(null);

  const logsEndRef = useRef(null);

  // 初始化遊戲
  const startGame = () => {
    setPlayerData(generateFleet());
    setEnemyData(generateFleet());
    setPlayerGridReveal(Array(GRID_SIZE).fill(null));
    setEnemyGridReveal(Array(GRID_SIZE).fill(null));
    setTurn('player');
    setCombo(0);
    setLogs(["遊戲開始！我方先攻。"]);
    setWinner(null);
    initAudio();
  };

  useEffect(() => { startGame(); }, []);
  useEffect(() => { if(logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const addLog = (msg, type='normal') => {
      setLogs(prev => [...prev, {msg, type}]);
  }

  const checkVictory = (shipsMap) => {
      return Object.values(shipsMap).every(ship => ship.isSunk);
  }

  // 點擊敵方陣地進行攻擊
  const handlePlayerAttack = (index) => {
    if (turn !== 'player' || winner) return;
    if (enemyGridReveal[index] !== null) return; // 已經打過

    initAudio();
    const newReveal = [...enemyGridReveal];
    const targetShipId = enemyData.board[index];

    if (targetShipId) {
        // HIT! (連擊迴圈開啟)
        newReveal[index] = targetShipId;
        setEnemyGridReveal(newReveal);
        
        let newCombo = combo + 1;
        setCombo(newCombo);
        
        let newEnemyData = { ...enemyData };
        let ship = newEnemyData.shipsMap[targetShipId];
        ship.hitCount += 1;
        
        if (ship.hitCount === ship.size) {
            ship.isSunk = true;
            playAudio('sunk');
            addLog(`💥 擊沉敵方 ${ship.name}！ (Combo x${newCombo})`, 'hit');
        } else {
            playAudio('hit', newCombo);
            addLog(`🎯 擊中敵方戰艦！獲得額外回合！ (Combo x${newCombo})`, 'hit');
        }

        setEnemyData(newEnemyData);

        if(checkVictory(newEnemyData.shipsMap)) {
            setWinner('player');
        }
        // Player keeps the turn!
    } else {
        // MISS (回合結束)
        playAudio('miss');
        newReveal[index] = 'miss';
        setEnemyGridReveal(newReveal);
        addLog(`💨 未擊中標籤。回合結束。`, 'miss');
        setCombo(0);
        setTurn('enemy');
    }
  };

  // 敵方 AI 盲狙邏輯 (BOT 替身)
  useEffect(() => {
      if (turn === 'enemy' && !winner) {
          const enemyBrain = setTimeout(() => {
              // 簡單盲狙：找一個還沒打過的點
              let available = [];
              playerGridReveal.forEach((val, idx) => { if(val === null) available.push(idx); });
              if(available.length === 0) return;
              
              let targetIndex = available[Math.floor(Math.random() * available.length)];
              const targetShipId = playerData.board[targetIndex];
              const newReveal = [...playerGridReveal];

              if(targetShipId) {
                  // BOT Hit!
                  newReveal[targetIndex] = targetShipId;
                  setPlayerGridReveal(newReveal);
                  
                  let newPlayerData = {...playerData};
                  let ship = newPlayerData.shipsMap[targetShipId];
                  ship.hitCount += 1;

                  if (ship.hitCount === ship.size) {
                      ship.isSunk = true;
                      addLog(`💀 敵方擊沉了我方 ${ship.name}!`, 'hit');
                      playAudio('sunk');
                  } else {
                      addLog(`⚠️ 我方船艦被擊中! 敵方繼續攻擊。`, 'hit');
                      playAudio('hit');
                  }
                  
                  setPlayerData(newPlayerData);
                  if(checkVictory(newPlayerData.shipsMap)) {
                      setWinner('enemy');
                  }
                  // BOT 再次攻擊 (利用重新 render 觸發 effect)
              } else {
                  // BOT Miss
                  newReveal[targetIndex] = 'miss';
                  setPlayerGridReveal(newReveal);
                  addLog(`🛡️ 敵方攻擊落空。換我方攻擊！`, 'miss');
                  playAudio('miss');
                  setTurn('player');
              }
          }, 800);
          return () => clearTimeout(enemyBrain);
      }
  }, [turn, playerGridReveal]);

  // 渲染網格
  const renderCell = (isEnemyGrid, index) => {
      const revealState = isEnemyGrid ? enemyGridReveal[index] : playerGridReveal[index];
      const shipId = isEnemyGrid ? enemyData?.board[index] : playerData?.board[index];
      const shipsMap = isEnemyGrid ? enemyData?.shipsMap : playerData?.shipsMap;
      
      let className = "cell";
      let content = "";

      if (!isEnemyGrid && shipId) {
          className += " ship"; // 我方陣地永遠顯示自己的船
      }

      if (revealState === 'miss') {
          className += " miss";
          content = "x";
      } else if (revealState !== null) {
          className += " hit";
          // 如果該船被擊沉，追加 sunk 樣式
          if(shipsMap[revealState].isSunk) {
              className += " sunk";
          }
      }

      const onClick = isEnemyGrid ? () => handlePlayerAttack(index) : null;

      return (
          <div key={index} className={className} onClick={onClick}>
              {content}
          </div>
      );
  }

  if (!playerData || !enemyData) return <div>Loadding Blueprint...</div>;

  return (
    <div className="app-container" onClick={initAudio}>
      <div className="header">BATTLESHIP PROTO</div>

      <div className={`turn-banner ${turn === 'enemy' ? 'enemy' : ''}`}>
          {turn === 'player' ? `🟢 你的回合 (Combo x${combo})` : `🔴 敵方開火中...`}
      </div>

      <div className="battlefield">
          {/* Enemy Grid (Player targets this) */}
          <div className="board-section">
              <div className="board-label">📡 雷達索敵 (點擊開火)</div>
              <div className={`grid ${turn === 'player' ? 'clickable' : ''}`}>
                  {Array(GRID_SIZE).fill(0).map((_, i) => renderCell(true, i))}
              </div>
          </div>

          <div className="logs">
              {logs.map((log, i) => (
                  <p key={i} className={`log-${log.type}`}>{log.msg}</p>
              ))}
              <div ref={logsEndRef}/>
          </div>

           {/* Player Grid (Bot targets this) */}
           <div className="board-section">
              <div className="board-label">🛡️ 我方陣地 (自動佈陣)</div>
              <div className="grid">
                  {Array(GRID_SIZE).fill(0).map((_, i) => renderCell(false, i))}
              </div>
          </div>
      </div>

      {winner && (
          <div className="victory-modal">
             <h1>{winner === 'player' ? 'VICTORY' : 'DEFEAT'}</h1>
             <button className="btn" onClick={startGame}>重新部署</button>
          </div>
      )}
    </div>
  )
}

export default App
