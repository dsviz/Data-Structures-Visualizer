
export interface Question {
    id: number;
    topic: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export const QUIZ_DATA: Question[] = [];
