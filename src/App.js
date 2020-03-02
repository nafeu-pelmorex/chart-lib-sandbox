import React from 'react';
import './App.css';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
// import { data } from './data';

function getFrontLoadedYValue(total, size, index) {
    let x = (index / size);
    let m = 3/2;
    let b = (total * 0);

    if (x > 1/3 && x <= 2/3) {
      m = 9/10;
      b = total * 1/2;
      x -= 1/3;
    } else if (x > 2/3 && x <= 3/3) {
      m = 3/5;
      b = total * 4/5;
      x -= 2/3;
    }

    let y = (m * (total * x)) + b;

    return y;
}

function generateFrontLoadedPacing(total, size) {
    let data = [];
    for (let i = 0; i <= size; i += 1) {
      data.push(
        [
          i,
          getFrontLoadedYValue(total, size, i)
        ]
      );
    }
    return data;
}

function generateEvenPacingData(total, size) {
    let data = [];
    for (let i = 0; i <= size; i += 1) {
      data.push(
        [
          i,
          total * (i / size)
        ]
      );
    }
    return data;
}

const option = {
    grid: {
        top: 40,
        left: 50,
        right: 40,
        bottom: 50
    },
    xAxis: {
        name: 'x',
        minorTick: {
            show: true
        },
    },
    yAxis: {
        name: 'y',
        min: 0,
        max: 100,
        minorTick: {
            show: true
        },
    },
    series: [
        {
            type: 'line',
            clip: true,
            data: generateFrontLoadedPacing(100, 24)
        },
        {
            type: 'line',
            clip: true,
            data: generateEvenPacingData(100, 24)
        },
    ]
};

const opts = {
  width: 'auto',
  height: '750px',
}

function App() {
  return (
    <div className="App">
      <div className="chart">
        <ReactEcharts
          option={option}
          notMerge={true}
          lazyUpdate={true}
          theme={"theme_name"}
          onChartReady={() => {}}
          onEvents={{}}
          opts={opts} />
      </div>
    </div>
  );
}

export default App;
