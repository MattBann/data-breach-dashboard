import { useEffect, useState } from 'react'
import BreachesTable from './BreachesTable.jsx'
import Tab from './Tab.jsx'
import Graphs from './Graphs.jsx'

/**
 * Application entry point
 * @returns React component
 */
function App() {
    const [data, setData] = useState(() => []);
    const [statistics, setStatistics] = useState(() => []);
    const [breachFetchError, setBreachFetchError] = useState(null);
    const [statsFetchError, setStatsFetchError] = useState(null);

    // Get the data used by this app from the backend API
    useEffect(() => {
        fetch("/api/breaches").then(response => response.json()).then(dat => {
            // console.log(dat)
            setData(dat);
        }).catch(() => setBreachFetchError(<p>Failed to get the breaches data</p>));
        fetch("/api/statistics").then(response => response.json()).then(dat => {
            setStatistics(dat);
        }).catch(() => setStatsFetchError(<p>Failed to get the graph data</p>));
    }, []);

    return (
        <>
            <div className="dark:bg-gray-900 bg-gray-100 min-h-dvh dark:text-white">
                <nav className="bg-blue-200 dark:bg-gray-800 flex">
                    <div className="float-left p-1">
                        <h1 className="font-bold text-2xl">Data Breach Dashboard</h1>
                    </div>
                </nav>
                <div id="content" className='p-1'>
                    <p className="my-1">This website shows statistics gathered from {<a className="underline" href="https://haveibeenpwned.com/">Have I Been Pwned</a>} about the various data breaches that have occurred since 2007. It has a focus on passwords and how they were stored on breached systems.</p>
                    {breachFetchError}
                    {statsFetchError}
                    {breachFetchError !== null || statsFetchError !== null ? <p className='my-1'>Try reloading the page again later</p> : undefined}
                    <Tab tabNames={["Table", "Graphs"]}>
                        {<BreachesTable data={data}/>}
                        {<Graphs statistics={statistics}/>}
                    </Tab>
                </div>
            </div>
        </>
    )
}

export default App
