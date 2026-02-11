
export interface AlgoInfo {
    name: string;
    description: string;
    complexity: {
        time: {
            best: string;
            average: string;
            worst: string;
        };
        space: string;
    };
    legend: {
        label: string;
        colorClass: string;
        description?: string;
    }[];
}

export const SORTING_INFO: Record<string, AlgoInfo> = {
    'Bubble Sort': {
        name: 'Bubble Sort',
        description: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
        complexity: {
            time: {
                best: 'O(n)',
                average: 'O(n²)',
                worst: 'O(n²)'
            },
            space: 'O(1)'
        },
        legend: [
            { label: 'Compare', colorClass: 'bg-indigo-500', description: 'Elements currently being compared' },
            { label: 'Swap', colorClass: 'bg-amber-500', description: 'Elements being swapped' },
            { label: 'Sorted', colorClass: 'bg-emerald-500', description: 'Elements in their final sorted position' }
        ]
    },
    'Selection Sort': {
        name: 'Selection Sort',
        description: 'Sorts an array by repeatedly finding the minimum element from unsorted part and putting it at the beginning.',
        complexity: {
            time: {
                best: 'O(n²)',
                average: 'O(n²)',
                worst: 'O(n²)'
            },
            space: 'O(1)'
        },
        legend: [
            { label: 'Current Min', colorClass: 'bg-rose-500', description: 'Current minimum found' },
            { label: 'Compare', colorClass: 'bg-indigo-500', description: 'Being compared with current min' },
            { label: 'Sorted', colorClass: 'bg-emerald-500', description: 'Sorted partition' }
        ]
    },
    'Insertion Sort': {
        name: 'Insertion Sort',
        description: 'Builds the final sorted array one item at a time, similar to how you sort playing cards in your hand.',
        complexity: {
            time: {
                best: 'O(n)',
                average: 'O(n²)',
                worst: 'O(n²)'
            },
            space: 'O(1)'
        },
        legend: [
            { label: 'Key', colorClass: 'bg-rose-500', description: 'Element being inserted' },
            { label: 'Compare', colorClass: 'bg-indigo-500', description: 'Compared with key' },
            { label: 'Sorted Sublist', colorClass: 'bg-emerald-500', description: 'Implicitly sorted part' }
        ]
    },
    'Merge Sort': {
        name: 'Merge Sort',
        description: 'A Divide and Conquer algorithm. It divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.',
        complexity: {
            time: {
                best: 'O(n log n)',
                average: 'O(n log n)',
                worst: 'O(n log n)'
            },
            space: 'O(n)'
        },
        legend: [
            { label: 'Left Partition', colorClass: 'bg-indigo-400', description: 'Left subarray' },
            { label: 'Right Partition', colorClass: 'bg-purple-400', description: 'Right subarray' },
            { label: 'Merging', colorClass: 'bg-amber-400', description: 'Currently being merged' },
            { label: 'Sorted', colorClass: 'bg-emerald-500', description: 'Merged and sorted segment' }
        ]
    },
    'Quick Sort': {
        name: 'Quick Sort',
        description: 'A Divide and Conquer algorithm. It picks an element as pivot and partitions the given array around the picked pivot.',
        complexity: {
            time: {
                best: 'O(n log n)',
                average: 'O(n log n)',
                worst: 'O(n²)'
            },
            space: 'O(log n)'
        },
        legend: [
            { label: 'Pivot', colorClass: 'bg-rose-500', description: 'Element chosen as pivot' },
            { label: 'Left < Pivot', colorClass: 'bg-indigo-400', description: 'Elements smaller than pivot' },
            { label: 'Right > Pivot', colorClass: 'bg-purple-400', description: 'Elements larger than pivot' },
            { label: 'Sorted', colorClass: 'bg-emerald-500', description: 'Pivot in final position' }
        ]
    }
};
