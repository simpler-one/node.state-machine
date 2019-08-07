export function escapeRegexp(s: string) {  
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
