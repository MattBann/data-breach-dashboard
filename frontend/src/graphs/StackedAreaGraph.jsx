import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2'
import { extendLabels } from '../utils/extenddata';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

/**
 * Formatted line graph with multiple lines and predictions
 * @param {object} props
 * @param {object} props.data graph data
 * @param {string} props.title title to show above the graph
 * @param {boolean} props.showPredictions whether to show the predictions, which should be included in the data
 * @returns {import('react').JSX.Element}
 */
function StackedAreaGraph({ data, title, showPredictions }) {
    const [isDarkMode, setIsDarkMode] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
    )

    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            // event.matches is true when dark mode
            setIsDarkMode(event.matches)
        });
    }, []);

    const numberOfPredictions = Math.max(...data.lines.map(l => l.trend.length));
    // Convert into stacked values
    let stackedData = Array(data.lines.length);
    let sums = Array(data.labels.length).fill(0);
    for (let i = 0; i < data.lines.length; i++) {
        stackedData[i] = data.lines[i].data.map((v, j) => v+sums[j]);
        sums = data.lines[i].data.map((v, j) => v+sums[j]);
    }
    
    if (showPredictions) {
        sums.length += numberOfPredictions-1;
        sums = sums.fill(0, -numberOfPredictions);
        
        for (let i = 0; i < data.lines.length; i++) {
            // stackedData[i+data.lines.length-1] = data.lines.map((v, j) => v+sums[j]);
            // sums = .data.map((v, j) => v+sums[j]);
            stackedData[i].length += numberOfPredictions-1;
            for (let j = 0; j < numberOfPredictions; j++) {
                stackedData[i][j+data.labels.length-1] = data.lines[i].trend[j]+sums[j+data.labels.length-1];
                // console.log(data.lines[i].trend[j]);
                
                sums[j+data.labels.length-1] += data.lines[i].trend[j];
            }
        }
    }
    
    stackedData = stackedData.map((d) => d.map((v,i) => v/sums[i]))
    console.log(stackedData);

    return <div className='dark:bg-gray-800 bg-gray-200 p-1 rounded-md m-1'>
        <h2 className='text-center font-bold'>{title}</h2>
        <Line
            datasetIdKey='id'
            data={{
                labels: showPredictions ? extendLabels(data.labels, numberOfPredictions - 1) : data.labels,
                datasets: data.lines.map((line, index) => {
                    return {
                        id: showPredictions ? index + data.lines.length : index, // use a different id for predictions to avoid redraw issues
                        data: stackedData[index],
                        label: line.label,
                        segment: {
                            borderDash: ctx => {
                                // console.log(ctx.p1DataIndex, data.data.length)
                                return showPredictions && ctx.p1DataIndex >= line.data.length - 1 ? [5, 5] : undefined
                            },
                        },
                        fill: index === 0 ? 'origin' : '-1',
                        spanGaps:true
                    }
                })
            }}
            options={{
                scales: {
                    x: {
                        grid: {
                            color: () => isDarkMode ? '#636363' : "#a0a0a0"
                        },
                        ticks: {
                            color: () => isDarkMode ? "#EDEDED" : "#101010"
                        }
                    },
                    y: {
                        grid: {
                            color: () => isDarkMode ? "#636363" : "#a0a0a0"
                        },
                        ticks: {
                            color: () => isDarkMode ? "#EDEDED" : "#101010"
                        }
                    },
                },
                // plugins.legend.display = false;
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: isDarkMode ? "#FFFFFF" : "#000000"
                        }
                    }
                }
            }}
            aria-label={`Stacked line graph of ${title}`}
        />
    </div>
}

export default StackedAreaGraph