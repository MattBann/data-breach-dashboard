import { Children, useState } from "react";

/**
 * Creates a set of tab buttons that control the visibility of the given children
 * @param {object} param0 props
 * @param {Array} param0.tabNames plain-text names to give each tab
 * @param {Array} param0.children the contents of each tab
 * @returns React component
 */
function Tab({tabNames, children}) {
    const [tabIndex, _setTabIndex] = useState(0)

    return <>
    <div className="flex py-1">
        {tabNames.map((tabName, index) => <button key={index} className={`p-1 px-2 cursor-pointer border first:rounded-l-md last:rounded-r-md border-collapse ${index===tabIndex ? "dark:bg-gray-700 bg-gray-400" : "dark:bg-gray-500 bg-gray-200"}`} onClick={() => _setTabIndex(index)}>
            {tabName}
        </button>)}
    </div>
    {Children.toArray(children)[tabIndex]}
</>}

export default Tab