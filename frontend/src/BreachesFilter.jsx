import { useRef, useState } from "react";
import ToggleButton from "./ToggleButton";
import FilterOption from "./FilterOption";
import { useOutsideAlerter } from "./utils/utils";
/**
 * React component for displaying and controlling filters on a table
 * @param {Object} props
 * @param {import("@tanstack/react-table").Table} props.table - the table the filter applies to
 * @returns React component
 */
function BreachesFilter({ table }) {
    const [popupActive, setPopupActive] = useState(false);

    // The list of all filters - not all of them are active
    const [allFilters, setAllFilters] = useState(() =>
        Object.assign(...table.getAllColumns()
            .filter(column => column.getCanFilter())
            .map(c => ({ [c.id]: { value: null, enabled: false } }))
        )
    );

    // Event handler for applying new filter state
    const handleFilterStateChange = (column, value, enabled) => {
        const oldValue = allFilters[column.id].value;
        const newState = {
            ...allFilters,
            [column.id]: {
                enabled: enabled,
                value: value ?? oldValue,
            }
        };
        setAllFilters(newState);

        // Only apply filter if active, otherwise unset it
        column.setFilterValue(newState[column.id].enabled ? newState[column.id].value : undefined);
    }

    // Handling for hiding the popup when clicking outside of it
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => setPopupActive(false));


    // Handling for applying quick filters
    const passwordQuickFilterActive = allFilters["DataClasses"]?.enabled && allFilters["DataClasses"]?.value?.includes("Passwords");

    const handleTogglePasswordQuickFilter = () => {
        handleFilterStateChange(
            table.getColumn("DataClasses"),
            passwordQuickFilterActive 
                ? allFilters["DataClasses"]?.value.filter(e => e !== "Passwords")
                : [...allFilters["DataClasses"]?.value ?? [], "Passwords"],
            true
        )
    }
    return <>
    <div className="py-1 relative" ref={wrapperRef}>
        <div className="flex">
            <ToggleButton label="Filter" value={popupActive} onToggle={() => setPopupActive(!popupActive)} />
            <span className="p-1">Quick filters: </span>
            <ToggleButton label="Password breaches" value={passwordQuickFilterActive} onToggle={handleTogglePasswordQuickFilter}/>
        </div>{
            popupActive ? <div className={`absolute z-10 bg-white border-2 p-1 my-0.5 rounded-md max-w-1/2 max-lg:max-w-2/3 w-full`}>
                {
                    table.getAllColumns().filter(column => column.getCanFilter()).map(column =>
                        <FilterOption
                            column={column}
                            enabled={allFilters[column.id].enabled}
                            currentValue={allFilters[column.id].value}
                            key={column.id}
                            onFilterStateChange={handleFilterStateChange}
                        />
                    )
                }
            </div> : undefined
        }
    </div>
    </>
}

export default BreachesFilter;


