'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook for detecting if screen is large enough for split view (xl: 1280px)
 * @returns boolean indicating if the screen width is >= 1280px
 */
export function useIsLargeScreen(): boolean {
    const [isLarge, setIsLarge] = useState(false);

    useEffect(() => {
        const checkSize = () => setIsLarge(window.innerWidth >= 1280);
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    return isLarge;
}
