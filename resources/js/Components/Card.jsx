export default function Card({ 
    children, 
    className = '',
    variant = 'default',
    padding = 'default',
    hover = false,
    ...props 
}) {
    const baseClasses = 'border border-gray-100 shadow-sm transition-all duration-300';
    
    const variants = {
        default: 'bg-white/80 backdrop-blur rounded-2xl',
        solid: 'bg-white rounded-2xl',
        glass: 'bg-white/60 backdrop-blur-lg rounded-2xl',
        outlined: 'bg-transparent border-2 border-red-200 rounded-2xl',
    };
    
    const paddings = {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
    };
    
    const hoverClasses = hover ? 'hover:shadow-xl hover:border-red-200 hover:scale-[1.02] cursor-pointer' : '';
    
    return (
        <div
            {...props}
            className={`${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`}
        >
            {children}
        </div>
    );
}