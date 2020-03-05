import React from 'react';
import './App.css';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import queryString from 'query-string';

const parsed = queryString.parse(window.location.search);

const TOTAL_TARGET = parsed.target ? parseInt(parsed.target) : 100;
const TIME_POINTS = parsed.points ? parseInt(parsed.points) : 24;

const getTimeParting = (timePoints) => {
  if (timePoints < 40) {
    return _.sortBy(_.uniq(_.map(_.range(_.random(1, Math.floor(timePoints / 2))), item => _.random(0, timePoints))));
  }

  let out = _.sortBy(_.uniq(_.map(_.range(_.random(1, 10)), item => _.random(0, timePoints))));

  return out;
}

const getTimePoints = (timePoints) => {
  return _.range(1, TIME_POINTS + 1);
}

const timePoints = getTimePoints(TIME_POINTS);
const timeParting = getTimeParting(TIME_POINTS);

const getIdealFrontLoadedPacingLine = ({ timePoints, timeParting }) => {
  const difference = _.difference(timePoints, timeParting);
  let [firstTercile, secondTercile, thirdTercile, remainder] = _.chunk(difference, Math.floor(difference.length / 3));

  if (remainder) {
    thirdTercile = _.concat(thirdTercile, remainder);
    if (remainder.length === 2) {
      const firstElementOfThirdTercile = _.take(thirdTercile);
      thirdTercile = _.difference(thirdTercile, firstElementOfThirdTercile);
      secondTercile = _.concat(secondTercile, firstElementOfThirdTercile);
    }
  }

  const yValueMapping = {};

  const firstTercileDelivery = TOTAL_TARGET * 0.5;
  const secondTercileDelivery = TOTAL_TARGET * 0.3;
  const thirdTercileDelivery = TOTAL_TARGET * 0.2;

  _.each(firstTercile, (item, index) => {
    yValueMapping[item] = firstTercileDelivery * ((index + 1) / firstTercile.length);
  });

  _.each(secondTercile, (item, index) => {
    yValueMapping[item] = secondTercileDelivery * ((index + 1) / secondTercile.length) + firstTercileDelivery;
  });

  _.each(thirdTercile, (item, index) => {
    yValueMapping[item] = thirdTercileDelivery * ((index + 1) / thirdTercile.length) + firstTercileDelivery + secondTercileDelivery;
  });

  const plot = [[0, 0]];
  let lastValue = 0;

  _.each(timePoints, item => {
    if (!_.includes(timeParting, item)) {
      lastValue = yValueMapping[item];
    }
    plot.push([item, lastValue]);
  })

  const markArea = _.map(timeParting, item => {
    return [
      {
        name: (item > 0 && timePoints.length < 40) ? item : "",
        xAxis: item - 1,
      },
      {
        xAxis: item
      }
    ];
  });

  return {
    plot,
    markArea
  }
};

const getIdealEvenPacingLine = ({ timePoints, timeParting }) => {
  const difference = _.difference(timePoints, timeParting);

  const yValueMapping = {};

  _.each(difference, (item, index) => {
    yValueMapping[item] = TOTAL_TARGET * ((index + 1) / difference.length);
  });

  const plot = [[0, 0]];
  let lastValue = 0;

  _.each(timePoints, item => {
    if (!_.includes(timeParting, item)) {
      lastValue = yValueMapping[item];
    }
    plot.push([item, lastValue]);
  });

  const markArea = _.map(timeParting, item => {
    return [
      {
        name: (item > 0 && timePoints.length < 40) ? item : "",
        xAxis: item - 1,
      },
      {
        xAxis: item
      }
    ];
  });

  return {
    plot,
    markArea
  }
}

const { plot: idealEvenPacing } = getIdealEvenPacingLine({
  timePoints,
  timeParting: []
});

const {
  plot: idealEvenPacingWithParting,
  markArea: idealEvenPacingWithPartingMarkArea
} = getIdealEvenPacingLine({
  timePoints,
  timeParting
});

const { plot: idealFrontLoadedPacing } = getIdealFrontLoadedPacingLine({
  timePoints,
  timeParting: []
});

const {
  plot: idealFrontLoadedPacingWithParting,
  markArea: idealFrontLoadedPacingWithPartingMarkArea
} = getIdealFrontLoadedPacingLine({
  timePoints,
  timeParting
});

const getOption = (override) => {
    return {
      title: {
        text: 'Ideal Progress Graph Examples',
        left: 'center'
      },
      grid: {
        top: 100,
        left: 50,
        right: 40,
        bottom: 50
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#ccc',
            borderColor: '#aaa',
            borderWidth: 1,
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            color: '#222'
          }
        }
      },
      legend: {
        data: [
          'Ideal Even Pacing',
          'Ideal Even Pacing (with Parting)',
          'Ideal Front-loaded Pacing',
          'Ideal Front-loaded Pacing (with Parting)'
        ],
        left: 10,
        top: 40,
      },
      xAxis: {
        name: 'x',
        max: TIME_POINTS,
        minorTick: {
          show: true
        },
      },
      yAxis: {
        name: 'y',
        min: 0,
        max: TOTAL_TARGET,
        minorTick: {
          show: true
        },
      },
      ...override
    }
};

const opts = {
  width: 'auto',
  height: '550vh',
}

function App() {
  return (
    <div className="App">
      <div className="chart">
        <ReactEcharts
          option={getOption({
            series: [
              {
                name: 'Ideal Even Pacing',
                type: 'line',
                clip: true,
                symbol: 'none',
                data: idealEvenPacing
              },
              {
                name: 'Ideal Even Pacing (with Parting)',
                type: 'line',
                clip: true,
                symbol: 'none',
                data: idealEvenPacingWithParting,
                markArea: {
                  data: idealEvenPacingWithPartingMarkArea
                }
              },
              {
                name: 'Ideal Front-loaded Pacing',
                type: 'line',
                clip: true,
                symbol: 'none',
                data: idealFrontLoadedPacing
              },
              {
                name: 'Ideal Front-loaded Pacing (with Parting)',
                type: 'line',
                clip: true,
                symbol: 'none',
                data: idealFrontLoadedPacingWithParting,
                markArea: {
                    data: idealFrontLoadedPacingWithPartingMarkArea
                }
              },
            ]
          })}
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
