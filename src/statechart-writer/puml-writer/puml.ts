import { StringLines } from "./string-lines";
import { PumlWriterOptions } from "./interface";


export class Puml {
    private readonly heads: StringLines = new StringLines();
    private readonly definitions: StringLines;
    private readonly transitions: StringLines = new StringLines();

    constructor(
        public readonly name: string,
        options: PumlWriterOptions,
    ) {
        this.definitions = new StringLines(options.indentChar, options.indentSize);
    }

    public newHead(head: string): void {
        this.heads.newLine(head);
    }

    public newDefinition(definition: string): void {
        this.definitions.newLine(definition);
    }

    public openBlock(): void {
        this.definitions.append(' {');
        this.definitions.indent();
    }

    public closeBlock(): void {
        this.definitions.newLine('}');
        this.definitions.newLine();
        this.definitions.unindent();
    }

    public newAction(state: string, action: string): void {
        this.definitions.newLine(`${state}: ${action}`);
    }

    public newIndexedAction(state: string, action: string, index: string): void {
        this.transitions.newLine(`${state}: ${index} ${action}`);
    }

    public newStart(from: string, to: string): void {
        this.transitions.newLine(`${from} --> ${to}`);
    }

    public newTransition(transition: string): void {
        this.transitions.newLine(transition);
    }

    public nextLine(): void {
        this.definitions.newLine();
        this.transitions.newLine();
    }

    public toString(): string {
        return [
            `@startuml ${this.name}`,
            ...this.heads.toArray(),
            '',
            ...this.definitions.toArray(),
            ...this.transitions.toArray(),
            `@enduml`
        ].join('\n');
    }
}
