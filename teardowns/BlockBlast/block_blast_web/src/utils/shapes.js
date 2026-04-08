// 基本的積木形狀定義
// 每個形狀是一個 2D 矩陣
export const SHAPES = {
  DOT: [[1]],
  SQUARE_2X2: [
    [1, 1],
    [1, 1]
  ],
  LINE_V2: [[1], [1]],
  LINE_H2: [[1, 1]],
  LINE_V3: [[1], [1], [1]],
  LINE_H3: [[1, 1, 1]],
  L_SHAPE: [
    [1, 0],
    [1, 1]
  ],
  L_SHAPE_REV: [
    [0, 1],
    [1, 1]
  ]
};

// 隨機獲取一個形狀
export const getRandomShape = () => {
  const keys = Object.keys(SHAPES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return SHAPES[randomKey];
};
