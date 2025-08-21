export default function PrimaryButton({
    className = '',
    disabled,
    children,
    variant = 'primary',
    size = 'md',
    ...props
}) {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500 shadow-sm hover:shadow-md',
        secondary: 'bg-white hover:bg-gray-50 text-red-600 border border-red-200 focus:ring-red-500 hover:border-red-300',
        outline: 'bg-transparent hover:bg-red-50 text-red-600 border border-red-300 focus:ring-red-500 hover:border-red-400',
        ghost: 'bg-transparent hover:bg-red-50 text-red-600 border border-transparent focus:ring-red-500'
    };
    
    const sizes = {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-xl',
        xl: 'px-8 py-4 text-lg rounded-xl'
    };
    
    return (
        <button
            {...props}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
