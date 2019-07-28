const DefaultIndentUnit = 4;

export class StringLines {

    public indentCount: number = 0;
    private readonly indentStr: string;
    private readonly lines: string[] = [];

    constructor(
        indentChar = ' ',
        indentUnitLength = DefaultIndentUnit,
    ) {
        this.indentStr = indentChar.repeat(indentUnitLength);
    }

    public newLine(line = ''): void {
        this.lines.push(this.indentStr.repeat(this.indentCount) + line);
    }

    public append(str: string): void {
        this.lines[this.lines.length - 1] += str;
    }

    public toArray(): string[] {
        return [...this.lines];
    }

    public indent(): void {
        this.indentCount++;
    }
    public unindent(): void {
        if (this.indentCount > 0) {
            this.indentCount--;
        }
    }
}