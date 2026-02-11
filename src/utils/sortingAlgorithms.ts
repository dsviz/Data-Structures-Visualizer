

export interface SortingFrame {
    array: number[];
    highlights: number[]; // Indices involved in comparison/swap
    sortedIndices: number[]; // Indices that are sorted
    codeLine: number; // Mapped line in SortingCode
    variables: Record<string, number>;
    description: string;
    // For Merge Sort Visualization
    mergeLevels?: MergeGroup[][];
}

export interface MergeGroup {
    id: string; // unique ID
    values: number[];
    startIdx: number; // Global index where this group starts (for alignment)
    state: 'default' | 'left' | 'right' | 'merging' | 'sorted' | 'overwrite' | 'pivot';
}

const createFrame = (
    array: number[],
    highlights: number[],
    sortedIndices: number[],
    codeLine: number,
    variables: Record<string, number>,
    description: string,
    mergeLevels?: MergeGroup[][]
): SortingFrame => ({
    array: [...array],
    highlights: [...highlights],
    sortedIndices: [...sortedIndices],
    codeLine,
    variables: { ...variables },
    description,
    mergeLevels: mergeLevels ? JSON.parse(JSON.stringify(mergeLevels)) : undefined
});

// --- Bubble Sort ---
export const generateBubbleSortFrames = (arr: number[]): SortingFrame[] => {
    const frames: SortingFrame[] = [];
    const n = arr.length;
    let array = [...arr];
    let sorted: number[] = [];

    frames.push(createFrame(array, [], [], 0, { n, i: 0 }, "Start Bubble Sort"));

    for (let i = 0; i < n - 1; i++) {
        frames.push(createFrame(array, [], sorted, 0, { n, i, j: 0 }, `Starting pass i=${i}`));
        let swapped = false;

        for (let j = 0; j < n - i - 1; j++) {
            frames.push(createFrame(array, [j, j + 1], sorted, 1, { n, i, j, 'arr[j]': array[j], 'arr[j+1]': array[j + 1] }, `Compare indices ${j} & ${j + 1}`));

            if (array[j] > array[j + 1]) {
                frames.push(createFrame(array, [j, j + 1], sorted, 2, { n, i, j, 'arr[j]': array[j], 'arr[j+1]': array[j + 1] }, `Swap: ${array[j]} > ${array[j + 1]}`));

                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swapped = true;

                frames.push(createFrame(array, [j, j + 1], sorted, 3, { n, i, j, 'arr[j]': array[j], 'arr[j+1]': array[j + 1] }, `Swapped`));
            }
        }
        sorted.push(n - 1 - i);
        if (!swapped) break;
    }
    // Final sorted state
    frames.push(createFrame(array, [], Array.from({ length: n }, (_, i) => i), 0, { n }, "Sorted!"));
    return frames;
};

// --- Selection Sort ---
export const generateSelectionSortFrames = (arr: number[]): SortingFrame[] => {
    const frames: SortingFrame[] = [];
    const n = arr.length;
    let array = [...arr];
    let sorted: number[] = [];

    frames.push(createFrame(array, [], [], 0, { n, i: 0 }, "Start Selection Sort"));

    for (let i = 0; i < n - 1; i++) {
        let min_idx = i;
        frames.push(createFrame(array, [i], sorted, 0, { n, i, min_idx }, `Starting pass i=${i}, min_idx=${min_idx}`));

        for (let j = i + 1; j < n; j++) {
            frames.push(createFrame(array, [min_idx, j], sorted, 2, { n, i, j, min_idx, 'arr[j]': array[j], 'val_min': array[min_idx] }, `Compare arr[${j}] < arr[${min_idx}]?`));

            if (array[j] < array[min_idx]) {
                min_idx = j;
                frames.push(createFrame(array, [min_idx], sorted, 3, { n, i, j, min_idx }, `New min found at ${min_idx}`));
            }
        }

        frames.push(createFrame(array, [i, min_idx], sorted, 4, { n, i, min_idx }, `Swap arr[${i}] and arr[${min_idx}]`));
        [array[min_idx], array[i]] = [array[i], array[min_idx]];
        sorted.push(i);
        frames.push(createFrame(array, [i, min_idx], sorted, 5, { n, i, min_idx }, `Swapped`));
    }
    frames.push(createFrame(array, [], Array.from({ length: n }, (_, i) => i), 0, { n }, "Sorted!"));
    return frames;
};

// --- Insertion Sort ---
export const generateInsertionSortFrames = (arr: number[]): SortingFrame[] => {
    const frames: SortingFrame[] = [];
    const n = arr.length;
    let array = [...arr];
    let sorted: number[] = []; // Insertion sort builds sorted sublist at start implicitly

    frames.push(createFrame(array, [], [], 0, { n, i: 1 }, "Start Insertion Sort"));

    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        frames.push(createFrame(array, [i], sorted, 0, { n, i, key, j }, `Select key=${key} at index ${i}`));

        while (j >= 0 && array[j] > key) {
            frames.push(createFrame(array, [j, j + 1], sorted, 2, { n, i, key, j, 'arr[j]': array[j] }, `Compare ${array[j]} > ${key}`));
            array[j + 1] = array[j];
            frames.push(createFrame(array, [j, j + 1], sorted, 3, { n, i, key, j }, `Shift ${array[j]} to right`));
            j = j - 1;
        }
        array[j + 1] = key;
        frames.push(createFrame(array, [j + 1], sorted, 5, { n, i, key, j: j + 1 }, `Insert key at ${j + 1}`));
    }

    frames.push(createFrame(array, [], Array.from({ length: n }, (_, i) => i), 7, { n }, "Sorted!"));
    return frames;
};


// --- Merge Sort ---
export const generateMergeSortFrames = (arr: number[]): SortingFrame[] => {
    const frames: SortingFrame[] = [];
    const array = [...arr];

    // We will visualize 5-6 levels deep for typical array size ~15
    // Level 0: Main array
    // Level 1: Split into 2
    // ...
    // Calculate max depth for visualization layout
    const maxDepth = Math.ceil(Math.log2(array.length)) + 2;

    // Initial state: Level 0 has the full array
    let levels: MergeGroup[][] = Array.from({ length: maxDepth }, () => []);
    levels[0] = [{ id: 'root', values: [...array], startIdx: 0, state: 'default' }];

    // Create initial frame
    frames.push(createFrame(array, [], [], 0, { n: array.length }, "Start Merge Sort", levels));

    let groupCounter = 0;

    const merge = (low: number, mid: number, high: number, depth: number) => {
        const leftLimit = mid - low + 1;
        const rightLimit = high - mid;

        // Locate the groups at `depth` corresponding to left and right parts
        // The left part starts at `low`, right at `mid+1`
        // We find, highlight, and merge them

        let groupsAtDepth = levels[depth];
        const leftGroupIdx = groupsAtDepth.findIndex(g => g.startIdx === low);
        const rightGroupIdx = groupsAtDepth.findIndex(g => g.startIdx === mid + 1);

        if (leftGroupIdx !== -1) groupsAtDepth[leftGroupIdx].state = 'left';
        if (rightGroupIdx !== -1) groupsAtDepth[rightGroupIdx].state = 'right';

        frames.push(createFrame(array, [], [], 5, { low, mid, high }, `Merging levels at depth ${depth}`, levels));

        const L = array.slice(low, mid + 1);
        const R = array.slice(mid + 1, high + 1);

        // Visualize the merge by creating a NEW group at `depth-1` that is being built
        // Wait, realistically we merge UP. So the groups at `depth` merge into `depth-1`
        // But in standard recursion, we return to the caller.

        // Let's create a temporary "merging" group at `depth-1` effectively overwriting what was there?
        // Actually, the group at `depth-1` was the one that split.
        // So we find the parent group at `depth-1` covering `low` to `high`.
        const parentGroupIdx = levels[depth - 1].findIndex(g => g.startIdx === low);
        if (parentGroupIdx !== -1) {
            levels[depth - 1][parentGroupIdx].values = []; // Clear it to fill
            levels[depth - 1][parentGroupIdx].state = 'merging';
        }

        let i = 0, j = 0, k = low;
        const mergedValues: number[] = [];

        while (i < leftLimit && j < rightLimit) {
            // Highlight comparison
            frames.push(createFrame(array, [low + i, mid + 1 + j], [], 5, { i, j, 'L': L[i], 'R': R[j] }, `Comparing ${L[i]} and ${R[j]}`, levels));

            if (L[i] <= R[j]) {
                array[k] = L[i];
                mergedValues.push(L[i]);
                if (parentGroupIdx !== -1) levels[depth - 1][parentGroupIdx].values = [...mergedValues];
                frames.push(createFrame(array, [k], [], 5, { val: L[i] }, `Taking ${L[i]} from left`, levels));
                i++;
            } else {
                array[k] = R[j];
                mergedValues.push(R[j]);
                if (parentGroupIdx !== -1) levels[depth - 1][parentGroupIdx].values = [...mergedValues];
                frames.push(createFrame(array, [k], [], 5, { val: R[j] }, `Taking ${R[j]} from right`, levels));
                j++;
            }
            k++;
        }

        while (i < leftLimit) {
            array[k] = L[i];
            mergedValues.push(L[i]);
            if (parentGroupIdx !== -1) levels[depth - 1][parentGroupIdx].values = [...mergedValues];
            frames.push(createFrame(array, [k], [], 5, { val: L[i] }, `Taking remaining ${L[i]} from left`, levels));
            i++; k++;
        }

        while (j < rightLimit) {
            array[k] = R[j];
            mergedValues.push(R[j]);
            if (parentGroupIdx !== -1) levels[depth - 1][parentGroupIdx].values = [...mergedValues];
            frames.push(createFrame(array, [k], [], 5, { val: R[j] }, `Taking remaining ${R[j]} from right`, levels));
            j++; k++;
        }

        // Mark merged group as sorted (or at least done for this step)
        if (parentGroupIdx !== -1) levels[depth - 1][parentGroupIdx].state = 'sorted';

        // Remove the children groups at `depth` as they are now merged up??
        // Or keep them but mark as processed?
        // Let's remove them to clean up the visual tree, or maybe fade them out?
        // For now, let's keep them but make them 'default' or less visible
        if (leftGroupIdx !== -1) groupsAtDepth[leftGroupIdx].state = 'default';
        if (rightGroupIdx !== -1) groupsAtDepth[rightGroupIdx].state = 'default';

        frames.push(createFrame(array, [], [], 5, { low, high }, `Merged range ${low}-${high}`, levels));
    };

    const mergeSort = (low: number, high: number, depth: number) => {
        if (low >= high) return;

        const mid = low + Math.floor((high - low) / 2);

        // Visualizing the split:
        // Create 2 new groups at `depth + 1`
        const leftVals = array.slice(low, mid + 1);
        const rightVals = array.slice(mid + 1, high + 1);

        levels[depth + 1].push({ id: `g-${groupCounter++}`, startIdx: low, values: leftVals, state: 'default' });
        levels[depth + 1].push({ id: `g-${groupCounter++}`, startIdx: mid + 1, values: rightVals, state: 'default' });

        // Sort the current level's groups by startIdx to keep them ordered in the array
        levels[depth + 1].sort((a, b) => a.startIdx - b.startIdx);

        frames.push(createFrame(array, [], [], 0, { low, mid, high }, `Splitting ${low}-${high} into ${low}-${mid} and ${mid + 1}-${high}`, levels));

        mergeSort(low, mid, depth + 1);
        mergeSort(mid + 1, high, depth + 1);
        merge(low, mid, high, depth + 1);
    };

    mergeSort(0, array.length - 1, 0);

    // Final clear frame
    frames.push(createFrame(array, [], Array.from({ length: array.length }, (_, i) => i), 0, {}, "Merge Sort Complete!", levels));

    return frames;
};

// --- Quick Sort ---
// --- Quick Sort ---
export const generateQuickSortFrames = (arr: number[]): SortingFrame[] => {
    const frames: SortingFrame[] = [];
    const array = [...arr];

    // Calculate max depth for visualization layout
    const maxDepth = array.length; // Worst case O(N)

    // Initial state: Level 0 has the full array
    let levels: MergeGroup[][] = Array.from({ length: maxDepth }, () => []);

    // We start with one group at level 0
    levels[0] = [{ id: 'root', values: [...array], startIdx: 0, state: 'default' }];

    frames.push(createFrame(array, [], [], 0, { n: array.length }, "Start Quick Sort", levels));

    let groupCounter = 0;

    const partition = (low: number, high: number, depth: number): number => {
        let pivot = array[high];

        // Find the group at this depth
        const groupIdx = levels[depth].findIndex(g => g.startIdx === low); // It should start at low
        if (groupIdx !== -1) {
            levels[depth][groupIdx].state = 'merging'; // Highlight active partition range
        }

        frames.push(createFrame(array, [high], [], 0, { low, high, pivot }, `Partitioning range ${low}-${high} with pivot ${pivot}`, levels));

        let i = (low - 1);

        for (let j = low; j < high; j++) {
            frames.push(createFrame(array, [j, high], [], 2, { j, pivot, 'arr[j]': array[j] }, `Comparing ${array[j]} < ${pivot}`, levels));

            if (array[j] < pivot) {
                i++;
                [array[i], array[j]] = [array[j], array[i]];

                // Update the group values to reflect swap?
                // The group at this level represents the array slice.
                if (groupIdx !== -1) {
                    // We need to sync the group values with the actual array slice
                    levels[depth][groupIdx].values = array.slice(low, high + 1); // includes pivot for now
                }

                frames.push(createFrame(array, [i, j], [], 3, { i, j, pivot }, `Swap ${array[i]} and ${array[j]}`, levels));
            }
        }

        // Swap pivot to correct position
        [array[i + 1], array[high]] = [array[high], array[i + 1]];

        if (groupIdx !== -1) {
            levels[depth][groupIdx].values = array.slice(low, high + 1);
        }

        frames.push(createFrame(array, [i + 1, high], [], 4, { i: i + 1, high }, `Place pivot at ${i + 1}`, levels));

        // Mark pivot in the group? 
        // Or better yet, we are done with this level's group. 
        // We will spawn children for the next level.
        if (groupIdx !== -1) levels[depth][groupIdx].state = 'default';

        return i + 1;
    };

    const quickSort = (low: number, high: number, depth: number) => {
        if (low < high) {
            // Ensure level array exists
            if (!levels[depth]) levels[depth] = [];

            // We expect a group to already exist at this level for this range (created by parent)
            // (Except for root)

            frames.push(createFrame(array, [], [], 0, { low, high }, `QuickSort range ${low}-${high}`, levels));

            let pi = partition(low, high, depth);

            // Create children groups for next level
            if (!levels[depth + 1]) levels[depth + 1] = [];

            // Left partition (if any)
            if (pi - 1 >= low) {
                const leftVals = array.slice(low, pi);
                levels[depth + 1].push({ id: `g-${groupCounter++}`, startIdx: low, values: leftVals, state: 'left' });
            }

            // Pivot "group" (single element) - visualized as sorted/fixed
            levels[depth + 1].push({ id: `g-${groupCounter++}`, startIdx: pi, values: [array[pi]], state: 'sorted' });

            // Right partition (if any)
            if (pi + 1 <= high) {
                const rightVals = array.slice(pi + 1, high + 1);
                levels[depth + 1].push({ id: `g-${groupCounter++}`, startIdx: pi + 1, values: rightVals, state: 'right' });
            }

            // Sort groups by index
            levels[depth + 1].sort((a, b) => a.startIdx - b.startIdx);

            frames.push(createFrame(array, [pi], [], 0, { pi }, `Pivot ${array[pi]} placed. Recursing...`, levels));

            quickSort(low, pi - 1, depth + 1);
            quickSort(pi + 1, high, depth + 1);
        } else if (low === high) {
            // Single element case
            if (!levels[depth]) levels[depth] = [];
            // Just ensure representation
            // It might have been created by parent as a partition
            // If we are here, we are a leaf

            // Mark as sorted in the structure?
            const groupIdx = levels[depth].findIndex(g => g.startIdx === low);
            if (groupIdx !== -1) levels[depth][groupIdx].state = 'sorted';

            // Also add to next level to visualize it propagating down?
            // Maybe not strictly necessary but looks consistent
            if (!levels[depth + 1]) levels[depth + 1] = [];
            levels[depth + 1].push({ id: `g-${groupCounter++}`, startIdx: low, values: [array[low]], state: 'sorted' });
            levels[depth + 1].sort((a, b) => a.startIdx - b.startIdx);

            frames.push(createFrame(array, [low], [], 0, { low }, `Single element ${array[low]} is sorted`, levels));
        }
    };

    quickSort(0, array.length - 1, 0);

    // Final sorted frame
    frames.push(createFrame(array, [], Array.from({ length: array.length }, (_, i) => i), 0, {}, "Quick Sort Complete!", levels));

    return frames;
};
