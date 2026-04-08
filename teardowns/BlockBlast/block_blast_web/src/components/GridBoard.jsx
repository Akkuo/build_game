import React from 'react';

const GridBoard = ({ grid }) => {
  return (
    <div id="grid-board" className="grid-board">
      {grid.map((cell, index) => (
        <div 
          key={index} 
          className="grid-cell"
          style={{
            backgroundColor: cell === 1 ? '#d35400' : '#333' // 被填滿時顯示亮橘色木紋
          }}
        ></div>
      ))}
    </div>
  );
};

export default GridBoard;
