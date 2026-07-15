/**
 * Simple toggle button
 * @param {Object} props
 * @param {import("react").ReactNode} props.label - label to display on toggle
 * @param {boolean} props.value - current value of this toggle
 * @param {function(boolean):void} props.onToggle - callback
 * @returns React component
 */
function ToggleButton({label, value=false, onToggle}) {
    // Event handler
    const handleToggle = () => {        
        const newState = !value; 
        if (onToggle) onToggle(newState);
    }

    return <button 
        type="button" 
        aria-pressed={value}
        className={`p-1 px-2 cursor-pointer border rounded-md ${value ? "dark:bg-gray-700 bg-gray-400" : "dark:bg-gray-500 bg-gray-200"}`}
        onClick={handleToggle}
        >
            {label}
        </button>;
}

export default ToggleButton;