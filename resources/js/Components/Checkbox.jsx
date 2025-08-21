export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'w-4 h-4 rounded border-gray-300 text-red-600 bg-gray-100 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-0 ' +
                className
            }
        />
    );
}
