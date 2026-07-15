import { useState } from 'react'
import BarGraph from './graphs/BarGraph'
import LineGraph from './graphs/LineGraph'
import MultiLineGraph from './graphs/MultiLineGraph'
import ToggleButton from './ToggleButton'
import StackedAreaGraph from './graphs/StackedAreaGraph'

/**
 * Creates the graphs data view
 * @param {object} param0 props
 * @param {Array} param0.statistics list of graph data
 * @returns React component
 */
function Graphs({ statistics }) {
    const [showPredictions, setShowPredictions] = useState(false);
    const [layoutColumns, setLayoutColumns] = useState(1);

    return <>
        <ToggleButton label="Show Predictions" value={showPredictions} onToggle={() => setShowPredictions(!showPredictions)} />
        <div className='flex items-center mt-1'>
            <div className='pr-1'>Number of columns:</div>
            <div>
                {Array.from({ length: 3 }).map((_it, index) => <button key={index + 1} className={`p-0.5 px-1 cursor-pointer border first:rounded-l-md last:rounded-r-md border-collapse ${layoutColumns === (index + 1) ? "dark:bg-gray-700 bg-gray-400" : "dark:bg-gray-500 bg-gray-200"}`} onClick={() => setLayoutColumns(index + 1)}>
                    {index + 1}
                </button>)}
            </div>
        </div>
        {statistics.length === 0 ? <p className=''>Loading...</p> :
            <div className={`grid grid-cols-(--chart-grid-cols)`} style={{ "--chart-grid-cols": `repeat(${layoutColumns}, minmax(0, 1fr))` }}>
                {statistics.map((stat, i) =>
                    stat?.type === "line" ?
                        <LineGraph title={stat?.title} data={stat} key={i} showPredictions={showPredictions} />
                        : stat?.type === "multiLine" ?
                            <>
                            <MultiLineGraph title={stat?.title} data={stat} key={i} showPredictions={showPredictions} />
                            <StackedAreaGraph title={stat?.title + " (stacked)"} data={stat} key={i} showPredictions={showPredictions} />
                            </>
                            : stat?.type === "bar" ?
                                <BarGraph title={stat?.title} data={stat} key={i} />
                                : undefined
                )}
            </div>
        }
    </>
}

export default Graphs