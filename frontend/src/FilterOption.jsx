import { useMemo, useRef, useState } from "react";
import { getDataClassColourIndex, timestampToISODate } from "./utils/utils";
import { flexRender } from "@tanstack/react-table";
import { useOutsideAlerter } from "./utils/utils";

/**
 * @callback filterStateCallback
 * @param {import("@tanstack/react-table").Column} column
 * @param {any|null} newValue
 * @param {boolean} enabled
 */

/**
 * React component for displaying and controlling a data filter for a specific column
 * @param {Object} props 
 * @param {import("@tanstack/react-table").Column} props.column - Table column
 * @param {boolean} props.enabled - Initial state of the filter
 * @param {filterStateCallback} props.onFilterStateChange - Function to call when the filter state changes
 * @returns React component
 */
function FilterOption({ column, enabled = false, onFilterStateChange, currentValue }) {
    // Event handler
    const handleCheckboxToggle = () => {
        const newState = !enabled;
        if (onFilterStateChange) onFilterStateChange(column, null, newState);
    }

    const { filterType } = column.columnDef.meta ?? {};

    return <div className="flex p-1 w-full">
        <div className="align-top flex w-1/3">
            <input className="" type="checkbox" name="filterEnabled" id="filterEnabled" checked={enabled} onChange={handleCheckboxToggle} />
            <span className="text-black pl-1 pr-1 self-center" onClick={handleCheckboxToggle}>{flexRender(column.columnDef.header)}</span>
        </div>
        {
            filterType === "selection" ?
                <SelectionFilter uniqueValues={Array.from(column.getFacetedUniqueValues().keys()).flat()} selectedValues={currentValue ?? []} callback={(newValue) => onFilterStateChange?.(column, newValue, enabled)} />
                : filterType === "dateRange" ?
                    <DateRangeFilter range={column.getFacetedMinMaxValues()?.map(timestampToISODate)} currentValue={currentValue?.map(timestampToISODate) ?? undefined} callback={(newValue) => onFilterStateChange?.(column, newValue, enabled)} />
                    : filterType === "range" ?
                        <RangeFilter range={column.getFacetedMinMaxValues()} currentValue={currentValue ?? undefined} callback={(newValue) => onFilterStateChange?.(column, newValue, enabled)} />
                        : filterType === "boolean" ?
                            <BooleanFilter currentValue={currentValue} callback={(newValue) => onFilterStateChange?.(column, newValue, enabled)} />
                            // Default to text filter
                            : <TextFilter type={column.getFilterFn().name} currentValue={currentValue ?? undefined} callback={(newType, newValue) => {
                                column.columnDef.filterFn = newType;
                                onFilterStateChange?.(column, newValue, enabled)
                            }} />
        }
    </div>
}

/**
 * React component for controlling a text filter
 * @param {Object} props
 * @param {string} props.type - String filter type, either `equalsString` or `includesString`
 * @param {string} props.currentValue - The current filter value
 * @param {function(string,string):void} props.callback - Callback function called when the filter value or type changes
 * @returns React component
 */
function TextFilter({ type = "equalsString", currentValue = "", callback }) {
    const handleTypeChange = (e) => {
        const newType = e.target.value;
        callback?.(newType, currentValue);
    }

    const handleTextChange = (e) => {
        const newText = e.target.value;
        callback?.(type, newText);
    }

    return <div className="flex w-full">
        <select 
            onChange={handleTypeChange} 
            value={type} 
            className="text-black border rounded-sm p-1"
        >
            <option value="equalsString">Equals</option>
            <option value="includesString" >Contains</option>
        </select>
        <input 
            type="text" 
            className="text-black p-1 border rounded-sm ml-1" 
            value={currentValue} 
            onChange={handleTextChange} 
        />
    </div>
}

/**
 * React component for controlling a Boolean filter
 * @param {Object} props
 * @param {boolean} props.currentValue - The current filter value
 * @param {function(boolean):void} props.callback - Callback function called when the filter value changes
 * @returns React component
 */
function BooleanFilter({ currentValue = false, callback }) {
    return <div className="flex w-full">
        <select 
            className="text-black border rounded-sm p-0.5" 
            value={currentValue ? "true" : "false"} 
            onChange={(e) => callback(e.target.value === "true")} 
        >
            <option value="true">Only include if true</option>
            <option value="false">Only include if false</option>
        </select>
    </div>
}

/**
 * React component for controlling a numerical range filter
 * @param {Object} props
 * @param {[number, number]} props.range - Allowed range of the filter
 * @param {[number, number]} props.currentValue - The current filter value
 * @param {function([number, number]):void} props.callback - Callback function called when the filter value changes
 * @returns React component
 */
function RangeFilter({ range = [0, 10000000000], currentValue = range, callback }) {
    const [rangeStart, rangeEnd] = range;
    const [currentStart, currentEnd] = currentValue;

    // Event handlers
    const handleStartChange = (e) => {
        const newStart = e.target.value;
        callback?.([newStart, currentEnd]);
    }

    const handleEndChange = (e) => {
        const newEnd = e.target.value;
        callback?.([currentStart, newEnd]);
    }

    return <div className="flex w-full">
        <span className="text-black p-1">From:</span>
        <input 
            type="number" 
            className="border text-black rounded-sm p-0.5" 
            min={rangeStart} 
            max={currentEnd} 
            value={currentStart} 
            onChange={handleStartChange} 
        />
        <span className="text-black p-1 pl-2">To:</span>
        <input 
            type="number" 
            className="border text-black rounded-sm p-0.5" 
            value={currentEnd} 
            min={currentStart} 
            max={rangeEnd} 
            onChange={handleEndChange} />
    </div>
}

/**
 * React component for controlling a date range filter
 * @param {Object} props
 * @param {[string, string]} props.range - Allowed range of the filter (in ISO date format)
 * @param {[string, string]} props.currentValue - The current filter value (in ISO date format)
 * @param {function([string,string]):void} props.callback - Callback function called when the filter value changes
 * @returns React component
 */
function DateRangeFilter({ range = ["1970-01-01", "2025-12-31"], currentValue = range, callback }) {
    const [rangeStart, rangeEnd] = range;
    const [currentStart, currentEnd] = currentValue;
    const handleStartDateChange = (e) => {
        const newDate = e.target.value;
        callback?.([Date.parse(newDate), Date.parse(currentEnd)]);
    }

    const handleEndDateChange = (e) => {
        const newDate = e.target.value;
        callback?.([Date.parse(currentStart), Date.parse(newDate)]);
    }

    return <div className="flex w-full">
        <span className="text-black p-1">From:</span>
        <input 
            type="date" 
            className="border text-black rounded-sm p-0.5" 
            min={rangeStart} 
            max={currentEnd} 
            value={currentStart} 
            onChange={handleStartDateChange} 
        />
        <span className="text-black p-1 pl-2">To:</span>
        <input 
            type="date" 
            className="border text-black rounded-sm p-0.5" 
            value={currentEnd} 
            min={currentStart} 
            max={rangeEnd} 
            onChange={handleEndDateChange} 
        />
    </div>
}

/**
 * React component for controlling a multi-selection filter
 * @param {Object} props
 * @param {string[]} props.uniqueValues - Allowed values for the filter
 * @param {boolean} props.selectedValues - The current selected filter values
 * @param {function(string[]):void} props.callback - Callback function called when the filter value changes
 * @returns React component
 */
function SelectionFilter({ uniqueValues, callback, selectedValues = [] }) {
    // Calculate the unique values
    const selectionValues = useMemo(() => {
        return Array.from(new Set(uniqueValues).values());
    }, [uniqueValues]);

    const [matchingValues, setMatchingValues] = useState(selectionValues);
    const [textInputValue, setTextInputValue] = useState("");
    const [showSelectionList, setShowSelectionList] = useState(false);

    // Event handlers
    const handleTextChange = (e) => {
        const newText = e.target.value;
        setTextInputValue(newText);
        setMatchingValues(
            selectionValues.filter(dataClass => dataClass.toLowerCase().includes(newText.toLowerCase()))
        );
    }

    const handleValueSelected = (className) => {
        const newSelectedValues = selectedValues.concat([className]);
        if (callback) callback(newSelectedValues);
    }

    const handleValueDeselected = (className) => {
        const newSelectedValues = selectedValues.filter(e => e != className);
        if (callback) callback(newSelectedValues);
    }

    // Handling for hiding dropdown on clicking outside it
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => { if (showSelectionList) setShowSelectionList(false) });

    return <div className="flex w-full">
        <div className="relative min-w-1/3 max-w-1/3 h-fit" ref={wrapperRef}>
            <input
                type="text"
                placeholder="Search"
                className="text-black border rounded-sm p-0.5 w-full"
                onChange={handleTextChange}
                onClick={() => { if (!showSelectionList) setShowSelectionList(true) }}
                value={textInputValue}
            />
            {showSelectionList ?
                <ul className="absolute top-full bg-gray-300 overflow-auto max-h-36 w-full">
                    {matchingValues.filter(
                        dataClass => !selectedValues.includes(dataClass)
                    ).map(dataClass => {
                        return <li
                            key={dataClass}
                            onClick={() => handleValueSelected(dataClass)}
                            className={`${getDataClassColourIndex(dataClass)} m-[0.4ch] p-[0.4ch] text-sm rounded-md w-fit h-fit hover:brightness-90 cursor-pointer`}
                        >
                            {dataClass}
                        </li>
                    })}
                </ul>
                : undefined}
        </div>
        <div className="flex flex-wrap max-h-[3lh] overflow-auto pl-0.5">
            {selectedValues.map((dataClass) => {
                return <div
                    key={dataClass}
                    onClick={() => handleValueDeselected(dataClass)}
                    className={`${getDataClassColourIndex(dataClass)} m-[0.4ch] p-[0.4ch] text-sm rounded-md w-fit h-fit hover:brightness-90 cursor-pointer`}
                >
                    ⨯ {dataClass}
                </div>
            })}
        </div>
    </div>
}

export default FilterOption;