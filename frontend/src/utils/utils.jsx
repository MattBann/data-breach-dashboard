import { useEffect } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 * @param {import("react").Ref} ref
 * @param {function():void} callback - alert callback
 */
export function useOutsideAlerter(ref, callback) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback?.()
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
}

// Define colours here so that tailwind compiler will see them and include them
const colourClasses = [
    "bg-blue-200 dark:bg-blue-600",
    "bg-blue-300 dark:bg-blue-700",
    "bg-blue-400 dark:bg-blue-800",
    "bg-blue-500 dark:bg-blue-900",
    "bg-indigo-200 dark:bg-indigo-600",
    "bg-indigo-300 dark:bg-indigo-700",
    "bg-indigo-400 dark:bg-indigo-800",
    "bg-indigo-500 dark:bg-indigo-900",
    "bg-sky-200 dark:bg-sky-600",
    "bg-sky-300 dark:bg-sky-700",
    "bg-sky-400 dark:bg-sky-800",
    "bg-sky-500 dark:bg-sky-900",
    "bg-violet-200 dark:bg-violet-600",
    "bg-violet-300 dark:bg-violet-700",
    "bg-violet-400 dark:bg-violet-800",
    "bg-violet-500 dark:bg-violet-900",
];
let dataClassColourLookupTable = {};
/**
 * Basic function to select a color for data classes in a deterministic but random-looking way
 * @param {string} dataClass The data class
 * @returns {string} Colour tailwind class
 */
export function getDataClassColourIndex(dataClass) {
    if (dataClass in dataClassColourLookupTable) {
        return dataClassColourLookupTable[dataClass];
    }

    let sum = 0;
    for (let i = 0; i < dataClass.length; i++) {
        sum += dataClass.charCodeAt(i);
    }
    sum %= colourClasses.length;

    dataClassColourLookupTable[dataClass] = colourClasses[sum];
    return dataClassColourLookupTable[dataClass];
}

/**
 * Utility function for converting a timestamp to an ISO date string
 * @param {number} timestamp - Number of seconds since the epoch
 * @returns {string}
 */
export function timestampToISODate(timestamp) {
    const date = new Date(timestamp);
    // Convert to string - NOTE: getUTCMonth returns 0-index month, so need to add 1, getDate is 1-indexed so is fine
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}
