import { useState, useEffect } from 'react';
import './App.css';

// 關卡寫死，用來避開複雜的逆轉演算法，專注在手感驗證。
// 陣列尾端代表「試管最上層水」。每個字串是一個顏色單位。
const TUBE_CAPACITY = 4;
const DEMO_LEVELS = [
  // Level 1: 教導期 (3 色 + 2 空)
  [
    ['red', 'blue', 'red', 'green'],
    ['blue', 'green', 'blue', 'red'],
    ['green', 'red', 'green', 'blue'],
    [],
    []
  ],
  // Level 2: 工作記憶期 (5 色 + 2 空)
  [
    ['yellow', 'orange', 'purple', 'blue'],
    ['blue', 'yellow', 'purple', 'green'],
    ['green', 'red', 'red', 'orange'],
    ['purple', 'blue', 'orange', 'yellow'],
    ['red', 'green', 'yellow', 'purple'],
    ['orange', 'green', 'blue', 'red'],
    [],
    []
  ]
];

function App() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [tubes, setTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [invalidTube, setInvalidTube] = useState(null); // 錯誤搖晃標記
  const [completedTubes, setCompletedTubes] = useState(new Set()); // 記錄單支過關以觸發特效
  const [isVictory, setIsVictory] = useState(false);
  
  // 記錄上一步以支援 Undo
  const [history, setHistory] = useState([]);
  
  // Audio context placeholders for Pitch Shifting
  const playSound = (type, pitchShift = 0) => {
    // 實作 Web Audio API 的 oscillator 來模擬 ASMR 水聲與音高拉升
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    let baseFreq = 400;
    if (type === 'click') baseFreq = 300;
    if (type === 'pour') baseFreq = 440 + (pitchShift * 30); // Pitch shift 引擎
    if (type === 'complete') baseFreq = 880; // 高潮音
    if (type === 'error') baseFreq = 150;
    
    osc.type = type === 'click' ? 'sine' : type === 'pour' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    
    if (type === 'pour') {
      // 模擬液體注入的 Pitch 逐漸上升 (腔體變短)
      osc.frequency.linearRampToValueAtTime(baseFreq + 100, ctx.currentTime + 0.3);
    }
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'pour' ? 0.3 : 0.1));
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };

  useEffect(() => {
    loadLevel(levelIndex);
  }, [levelIndex]);

  const loadLevel = (index) => {
    const levelData = DEMO_LEVELS[index] || DEMO_LEVELS[0];
    setTubes(JSON.parse(JSON.stringify(levelData))); // Deep copy
    setSelectedTube(null);
    setInvalidTube(null);
    setIsVictory(false);
    setHistory([]);
    setCompletedTubes(new Set());
  };

  // 實作 Game Designer 定義的核心規則
  const handleTubeClick = (index) => {
    // 防呆：動畫期間不給點 (這裡以 React 狀態瞬切暫時不卡鎖，但可用延遲鎖定)
    if (isVictory) return;

    // 1. 如果尚未選擇來源管
    if (selectedTube === null) {
      if (tubes[index].length === 0) {
        playSound('error');
        setInvalidTube(index);
        setTimeout(() => setInvalidTube(null), 350);
        return; // 不能選空管
      }
      setSelectedTube(index);
      playSound('click');
      return;
    }

    // 2. 如果點擊原本已選擇的管 (取消選擇)
    if (selectedTube === index) {
      setSelectedTube(null);
      playSound('click');
      return;
    }

    // 3. 嘗試傾倒 (Pour Algorithm)
    const sourceTube = tubes[selectedTube];
    const targetTube = tubes[index];
    
    const sourceTopColor = sourceTube[sourceTube.length - 1];
    const targetTopColor = targetTube.length > 0 ? targetTube[targetTube.length - 1] : null;

    // 規格確認：目標滿了？或目標顏色不對且不為空？
    if (targetTube.length === TUBE_CAPACITY || (targetTopColor !== null && targetTopColor !== sourceTopColor)) {
      playSound('error');
      setInvalidTube(index);
      setTimeout(() => setInvalidTube(null), 350);
      setSelectedTube(null); // 放下來源
      return;
    }

    // 可行！開始搬運連續色塊
    const newTubes = JSON.parse(JSON.stringify(tubes));
    let colorToMoveCount = 0;
    // 計算可以搬多少個區塊
    for (let i = sourceTube.length - 1; i >= 0; i--) {
      if (sourceTube[i] === sourceTopColor) colorToMoveCount++;
      else break;
    }
    
    // 取 目標剩餘空間 與 來源同色區塊數 的最小值
    const availableSpace = TUBE_CAPACITY - targetTube.length;
    const actualMoves = Math.min(colorToMoveCount, availableSpace);

    // 紀錄 Undo
    setHistory([...history, JSON.parse(JSON.stringify(tubes))]);

    // 執行轉移
    for (let i = 0; i < actualMoves; i++) {
        newTubes[index].push(newTubes[selectedTube].pop());
    }

    // Pitch Shift: 音高隨著目標管水位上升
    playSound('pour', newTubes[index].length);
    
    setTubes(newTubes);
    setSelectedTube(null);

    // 判定單管完成
    if (newTubes[index].length === TUBE_CAPACITY) {
      const isPure = newTubes[index].every(c => c === sourceTopColor);
      if (isPure) {
        setTimeout(() => playSound('complete'), 300);
        setCompletedTubes(prev => new Set(prev).add(index));
      }
    }

    checkVictory(newTubes);
  };

  const checkVictory = (currentTubes) => {
    let win = true;
    for (let tube of currentTubes) {
      if (tube.length > 0) {
        if (tube.length < TUBE_CAPACITY) win = false;
        const color = tube[0];
        if (!tube.every(c => c === color)) win = false;
      }
    }
    
    if (win) {
      setTimeout(() => setIsVictory(true), 500); // 延遲讓玩家看完滿管特效
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setTubes(lastState);
    setHistory(history.slice(0, -1));
    playSound('click');
    
    // 重新檢查完整度
    const newCompleted = new Set();
    lastState.forEach((tube, idx) => {
        if(tube.length === TUBE_CAPACITY && tube.every(c => c === tube[0])) {
            newCompleted.add(idx);
        }
    });
    setCompletedTubes(newCompleted);
  };

  // 變現手段：看廣告加管子
  const addTube = () => {
    const newTubes = [...tubes, []];
    setTubes(newTubes);
    setHistory([...history, JSON.parse(JSON.stringify(tubes))]); // add to history so it doesn't break undo length technically
    playSound('complete');
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Magic Sort</h1>
        <div className="level-info">LEVEL {levelIndex + 1}</div>
      </div>

      <div className="controls">
        <button className="btn-secondary" onClick={undo} disabled={history.length === 0}>
          ↩ Undo ({history.length})
        </button>
        <button className="btn-secondary" onClick={addTube} style={{color: '#ff9500', borderColor: '#ff9500'}}>
          🎬 Ad: +1 Tube
        </button>
      </div>

      <div className="tubes-container">
        {tubes.map((tube, idx) => {
          const isSelected = selectedTube === idx;
          const isInvalid = invalidTube === idx;
          const isCompleted = completedTubes.has(idx);

          return (
            <div 
              key={idx} 
              className={`tube-wrapper ${isSelected ? 'selected' : ''} ${isInvalid ? 'invalid' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleTubeClick(idx)}
            >
              <div className="tube">
                {tube.map((color, colorIdx) => (
                  <div 
                    key={colorIdx} 
                    className={`liquid color-${color}`}
                  ></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isVictory && (
        <div className="victory-overlay">
          <h2>Level Cleared!</h2>
          <button className="btn-primary" onClick={() => setLevelIndex((prev) => (prev + 1) % DEMO_LEVELS.length)}>
            Next Level ➔
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
