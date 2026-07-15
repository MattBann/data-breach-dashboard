import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2'
import { extendLabels } from '../utils/extenddata';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

/**
 * Formatted line graph with predictions
 * @param {object} props
 * @param {object} props.data graph data
 * @param {string} props.title title to show above the graph
 * @param {boolean} props.showPredictions whether to show the predictions, which should be included in the data
 * @returns {import('react').JSX.Element}
 */
function LineGraph({ data, title, showPredictions }) {
    // Supplemental state for enabling light/dark mode switching in graphs
    const [isDarkMode, setIsDarkMode] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    // Event handler for light/dark model switching in graphs
    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event =>
            // event.matches is true when dark mode
            setIsDarkMode(event.matches)
        );
    }, []);

    return <div className='dark:bg-gray-800 bg-gray-200 p-1 rounded-md m-1'>
        <h2 className='text-center font-bold'>{title}</h2>
        <Line
            datasetIdKey='id'
            data={{
                labels: showPredictions ? extendLabels(data.labels, data.trend.length - 1) : data.labels,
                datasets: [
                    {
                        id: showPredictions ? 2 : 1, // use a different id for predictions to avoid redraw issues
                        // data: data.data.concat(generateLinearData(data.trend.slope, data.trend.intercept, data.data.length, 2)),
                        data: showPredictions ? data.data.slice(0, -1).concat(data.trend) : data.data,
                        segment: {
                            borderDash: ctx => {
                                // console.log(ctx.p1DataIndex, data.data.length)
                                return showPredictions && ctx.p1DataIndex >= data.data.length - 1 ? [5, 5] : undefined
                            }
                        }
                    }
                ]
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
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }}
            aria-label={`Line graph of ${title}`}
        />
    </div>
}

export default LineGraph