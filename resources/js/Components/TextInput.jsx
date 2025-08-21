import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/80 backdrop-blur placeholder-gray-400 text-gray-900 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-60 disabled:cursor-not-allowed ' +
                className
            }
            ref={localRef}
        />
    );
});
