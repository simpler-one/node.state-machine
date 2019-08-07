import { escapeRegexp } from "../../utils";

const NonId = new RegExp(Array.from(
    ' -=/,:;@%&<>~`\'"+|\\[]{}()!?*^'
)
.map(s => escapeRegexp(s))
.join('|'), 'g');


export function idOf(name: string): string {
    return name
        .trim()
        .replace(NonId, '_')
    ;
}

export function pathOf(from: string, to: string): string {
    return `${from}-path-${to}`;
}
