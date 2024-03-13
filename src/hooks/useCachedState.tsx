import { useEffect, useRef, useState } from "react";

export function useCachedState<T extends {}>(initActionSet: string, initAction: string, keySuffix: string, defaultData: T) {
    const key = `JunkStore_${initActionSet}_${initAction}_${keySuffix}`;
    const cache = localStorage.getItem(key);
    const hadCache = !!cache;
    const [cacheState, setCacheState] = useState<T>(hadCache ? JSON.parse(cache) : defaultData);

    const hasRendered = useRef(false);
    const saveCache = () => localStorage.setItem(key, JSON.stringify(cacheState));

    useEffect(() => {
        if (!hasRendered.current) hasRendered.current = true;
        else saveCache();
    }, [cacheState]);

    return { cacheState, setCacheState, saveCache, hadCache };
}
