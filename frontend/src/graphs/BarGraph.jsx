import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

/**
 * Formatted bar graph
 * @param {object} props
 * @param {object} props.data graph data
 * @param {string} props.title title to show above the graph
 * @returns {import('react').JSX.Element}
 */
function BarGraph({data, title}) {
    const [isDarkMode, setIsDarkMode] = useState(() => 
        window.matchMedia('(prefers-color-scheme: dark)').matches
    )
    
    useEffect(() => {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            // event.matches is true when dark mode
            setIsDarkMode(event.matches)
    });}, [])
    return <div className='dark:bg-gray-800 bg-gray-200 p-1 rounded-md m-1'>
        <h2 className='text-center font-bold'>{title}</h2>
        <Bar
            datasetIdKey='id'
            data={{
                labels: data.labels,
                datasets: [{
                    id: 1,
                    data: data.data
                }]
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
            aria-label={`Bar graph of ${title}`}
        />      
    </div> 
} 

export default BarGraph