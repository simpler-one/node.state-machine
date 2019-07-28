export class StringLines {

    public indent: number = 0;
    public indentChar: string = ' ';

    private readonly lines: string[] = [];

    public newLine(line = ''): void {
        this.lines.push(this.indentChar.repeat(this.indent) + line);
    }

    public append(str: string): void {
        this.lines[this.lines.length - 1] += str;
    }

    public toArray(): string[] {
        return [...this.lines];
    }
}