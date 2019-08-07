export function escapeRegexp(s: string): string {  
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
