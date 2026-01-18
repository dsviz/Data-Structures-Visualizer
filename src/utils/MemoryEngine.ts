export interface Variable {
    id: string; // Unique ID for React keys
    name: string;
    type: string;
    value: string;
    address: string;
    isPointer: boolean;
    targetAddress?: string | null; // If it's a pointer, what address does it hold?
    isArray?: boolean; // New: Is this an array?
    arrayValues?: (number | null)[]; // New: Array contents
}

export interface StackFrame {
    id: string;
    functionName: string;
    variables: Variable[];
}

export interface HeapBlock {
    id: string;
    address: string;
    value: string;
    type: string;
    size: number;
    fields?: { [key: string]: any };
}

export interface MemoryState {
    stack: StackFrame[];
    heap: HeapBlock[];
    output: string[];
    currentLineIndex: number; // The line of code that produced this state
}

export class MemoryEngine {
    private addressCounter: number;

    constructor() {
        this.addressCounter = 0x7fff0000; // Start simulalating high stack addresses
    }

    private generateAddress(): string {
        this.addressCounter -= 4; // Decrement for stack growth (simplified)
        return '0x' + this.addressCounter.toString(16);
    }

    private cloneState(currentState: MemoryState, newLineIndex: number): MemoryState {
        return {
            stack: currentState.stack.map(frame => ({
                ...frame,
                variables: frame.variables.map(v => ({
                    ...v,
                    arrayValues: v.arrayValues ? [...v.arrayValues] : undefined
                }))
            })),
            heap: currentState.heap.map(b => ({
                ...b,
                fields: b.fields ? { ...b.fields } : undefined
            })),
            output: [...currentState.output],
            currentLineIndex: newLineIndex
        };
    }

    public runCode(code: string): MemoryState[] {
        // Reset internal state for a new run
        this.addressCounter = 0x7fff0000;
        let heapCounter = 0x10000000; // Heap starts low

        // Initial State: Empty
        let currentState: MemoryState = {
            stack: [],
            heap: [],
            output: [],
            currentLineIndex: -1
        };

        const trace: MemoryState[] = [currentState];

        // Create main stack frame immediately
        const mainFrame: StackFrame = {
            id: 'frame_main',
            functionName: 'main',
            variables: []
        };
        currentState.stack.push(mainFrame);

        const lines = code.split('\n');

        // Iterate line by line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip empty or comments
            if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

            // Handle printf/cout (simplified)
            if (trimmed.startsWith('printf') || trimmed.startsWith('cout')) {
                // ... (existing printf logic, abbreviated for brevity, assuming generic enough)
                const match = trimmed.match(/"([^"]*)"/);
                if (match) {
                    currentState.output.push(match[1]);
                } else {
                    const parts = trimmed.split(',');
                    if (parts.length > 1) {
                        const varName = parts[1].replace(');', '').trim();
                        // Check stack
                        const variable = mainFrame.variables.find(v => v.name === varName);
                        if (variable) {
                            currentState.output.push(variable.value);
                        }
                        // Check heap (if varName is ptr->val)
                        else if (varName.includes('->')) {
                            const [ptrName, field] = varName.split('->');
                            const ptr = mainFrame.variables.find(v => v.name === ptrName);
                            if (ptr && ptr.targetAddress) {
                                const heapObj = currentState.heap.find(h => h.address === ptr.targetAddress);
                                if (heapObj && heapObj.fields && heapObj.fields[field]) {
                                    currentState.output.push(String(heapObj.fields[field]));
                                }
                            }
                        }
                    }
                }
            }

            // Handle Allocations

            // 1. Array Declaration: int arr[] = {1, 2, 3};
            const arrayMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\[.*\]\s*=\s*\{([^}]*)\};/);
            if (arrayMatch) {
                const [_, type, name, valsStr] = arrayMatch;
                const vals = valsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                const addr = this.generateAddress();
                mainFrame.variables.push({
                    id: `var_${name}`,
                    name,
                    type: `${type}[]`,
                    value: `{${vals.join(', ')}}`,
                    address: addr,
                    isPointer: false,
                    isArray: true,
                    arrayValues: vals
                });
            }

            // 2. Struct/Node Allocation: Node* head = new Node(10); OR TreeNode* root = new TreeNode(5);
            // Regex: generic "Type* name = new Type(value);"
            const allocMatch = trimmed.match(/^([a-zA-Z0-9_]+)\*\s+([a-zA-Z0-9_]+)\s*=\s*new\s+([a-zA-Z0-9_]+)\((.*)\);/);
            if (allocMatch) {
                const [_, type, name, constructorType, args] = allocMatch;
                const heapAddr = '0x' + heapCounter.toString(16);
                heapCounter += 16; // increment heap

                // Parse arg (simple value)
                const val = args.trim();

                // Create Heap Object
                const heapObj: HeapBlock = {
                    id: `heap_${heapAddr}`,
                    address: heapAddr,
                    value: `Object(${constructorType})`,
                    type: constructorType,
                    size: 16, // arbitrary
                    fields: {
                        val: val // Default constructor assumes first arg is value
                    }
                };

                // Initialize pointers to null based on type
                if (constructorType.includes('Node') || constructorType.includes('List')) {
                    heapObj.fields!.next = null;
                }
                if (constructorType.includes('Tree') || constructorType.includes('Binary')) {
                    heapObj.fields!.left = null;
                    heapObj.fields!.right = null;
                }

                currentState.heap.push(heapObj);

                // Create Stack Reference
                const stackAddr = this.generateAddress();
                mainFrame.variables.push({
                    id: `var_${name}`,
                    name: name,
                    type: `${type}*`, // e.g. Node*
                    value: heapAddr,
                    address: stackAddr,
                    isPointer: true,
                    targetAddress: heapAddr
                });
            }

            // 3. Pointer Assignment (existing) -> modified to handle simpler cases
            // ... (keep existing pointer logic if it doesnt conflict)
            const pointerMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*\*\s*([a-zA-Z0-9_]+)\s*=\s*&([a-zA-Z0-9_]+)(?:\[(\d+)\])?;?$/);
            if (pointerMatch) {
                // ... existing pointer logic ...
                const [_, type, name, targetName, indexStr] = pointerMatch;
                const targetVar = mainFrame.variables.find(v => v.name === targetName);
                let targetAddr = '0x000000';
                if (targetVar) {
                    targetAddr = indexStr && targetVar.isArray
                        ? '0x' + (parseInt(targetVar.address, 16) + parseInt(indexStr) * 4).toString(16)
                        : targetVar.address;
                }
                const addr = this.generateAddress();
                mainFrame.variables.push({
                    id: `var_${name}`,
                    name,
                    type: `${type}*`,
                    value: targetAddr,
                    address: addr,
                    isPointer: true,
                    targetAddress: targetAddr
                });
            }
            // 4. Arrow Assignment: head->next = new Node(20); OR ptr->left = ...
            const arrowAssignMatch = trimmed.match(/^([a-zA-Z0-9_]+)->([a-zA-Z0-9_]+)\s*=\s*(.+);/);
            if (arrowAssignMatch) {
                const [_, ptrName, field, rhs] = arrowAssignMatch;
                const ptr = mainFrame.variables.find(v => v.name === ptrName);

                if (ptr && ptr.targetAddress) {
                    const heapObj = currentState.heap.find(h => h.address === ptr.targetAddress);
                    if (heapObj && heapObj.fields) {
                        // Check if RHS is a new allocation: new Node(20)
                        const rhsAlloc = rhs.match(/new\s+([a-zA-Z0-9_]+)\((.*)\)/);
                        if (rhsAlloc) {
                            const [__, consType, args] = rhsAlloc;
                            const newHeapAddr = '0x' + heapCounter.toString(16);
                            heapCounter += 16;

                            const newObj: HeapBlock = {
                                id: `heap_${newHeapAddr}`,
                                address: newHeapAddr,
                                value: `Object(${consType})`,
                                type: consType,
                                size: 16,
                                fields: { val: args.trim() }
                            };
                            if (consType.includes('Node')) newObj.fields!.next = null;
                            if (consType.includes('Tree')) { newObj.fields!.left = null; newObj.fields!.right = null; }

                            currentState.heap.push(newObj);
                            heapObj.fields[field] = newHeapAddr; // Link them!
                        } else {
                            // RHS might be another variable: curr = prev
                            // or assignment: head->val = 50
                            // Simplified: if RHS is a variable name that is a pointer, assign address
                            const rhsVar = mainFrame.variables.find(v => v.name === rhs.trim());
                            if (rhsVar && rhsVar.isPointer) {
                                heapObj.fields[field] = rhsVar.targetAddress;
                            } else {
                                // Literal assignment? head->val = 10
                                heapObj.fields[field] = rhs.trim();
                            }
                        }
                    }
                }
            }

            // 5. Simple Variable (Catch-all for int x=10 etc)
            // Ensure we didn't match any of the above
            if (!arrayMatch && !allocMatch && !pointerMatch && !arrowAssignMatch) {
                const simpleVarMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_]+)\s*=\s*(.+);/);
                if (simpleVarMatch) {
                    const [_, type, name, valExpr] = simpleVarMatch;
                    let finalVal = valExpr.trim();
                    const addr = this.generateAddress();
                    mainFrame.variables.push({
                        id: `var_${name}`,
                        name, type, value: finalVal, address: addr, isPointer: false
                    });
                } else {
                    // 6. Final Assignment: x = 20; (if not declared above)
                    const assignMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+);/);
                    if (assignMatch) {
                        const [_, name, val] = assignMatch;
                        const target = mainFrame.variables.find(v => v.name === name);
                        if (target) {
                            target.value = val.trim();
                        }
                    }
                }
            }

            trace.push(this.cloneState(currentState, i));
        }

        // ... final state logic ...
        const finalState = this.cloneState(currentState, lines.length);
        finalState.output.push("> Exit code 0");
        trace.push(finalState);
        return trace;
    }

    // Helper: checks if line was handled by previous regexes to avoid double processing
    // Implementation detail in real code, here just logic flow

}
