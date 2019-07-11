// tslint:disable:no-namespace

/**
 * @param indices 0-based index array
 * @param count 1-based count
 */
export type AutoIndex = (indices: number[], count: number) => string;
export namespace AutoIndex {
    const SmallA: number = 'a'.charCodeAt(0);
    const LargeA: number = 'A'.charCodeAt(0);
    const AlphaSpan: number = 'Z'.charCodeAt(0) - LargeA + 1;

    export const Number: AutoIndex = (indices, count) => `(${count})`;
    export const NumberDot: AutoIndex = (indices, count) => `${count}.`;
    export const NumberColon: AutoIndex = (indices, count) => `${count}:`;
    export const Alpha: AutoIndex = (indices, count) => alphaOf(count - 1, LargeA);
    export const NumIndex: AutoIndex = (indices) => `(${indices.map(index => index + 1).join('.')})`;
    export const AlphaNumIndex: AutoIndex = (indices) => `(${alphaOf(indices[0], SmallA)}${indices[1] + 1})`;
    export const LargeAlphaNumIndex: AutoIndex = (indices) => `(${alphaOf(indices[0], LargeA)}${indices[1] + 1})`;

    function alphaOf(value: number, charCodeOffset: number): string {
        let result = '';
        let val = value;

        do {
            result = String.fromCharCode(charCodeOffset + val % AlphaSpan) + result;
            val = Math.floor(val / AlphaSpan);
        } while (val > 0)

        return result;
    }
}
