import { useEffect, useState } from "react";

export function useCachedData<T extends {}>(initActionSet: string, initAction: string, keySuffix: string, defaultData: T) {
    const key = `${initActionSet}_${initAction}_${keySuffix}`;
    const cache = localStorage.getItem(key);
    const [cacheData, setCacheData] = useState(defaultData);

    const hadCache = !!cache

    const loadCache = () => { if (hadCache) setCacheData(JSON.parse(cache)); };
    const saveCache = () => localStorage.setItem(key, JSON.stringify(cacheData));

    useEffect(() => loadCache(), []);
    useEffect(() => saveCache(), [cacheData]);

    return { cacheData, setCacheData, loadCache, saveCache, hadCache };
}
