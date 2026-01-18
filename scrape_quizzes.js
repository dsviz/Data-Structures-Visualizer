import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TARGET_URL = 'https://www.sanfoundry.com/1000-data-structure-questions-answers/'; // Example URL for Arrays
const OUTPUT_FILE = 'src/data/quizData.ts';

// Add more URLs for different topics if needed, for this task I'll just fetch from one comprehensive page or a few.
const TOPICS = [
    { url: 'https://www.sanfoundry.com/data-structure-questions-answers-avl-tree/', topic: 'AVL Tree' },
    { url: 'https://www.sanfoundry.com/b-tree-multiple-choice-questions-answers-mcqs/', topic: 'B-Tree' },
    { url: 'https://www.sanfoundry.com/b-plus-tree-multiple-choice-questions-answers-mcqs/', topic: 'B+Tree' },
    { url: 'https://www.sanfoundry.com/data-structure-questions-answers-queue-operations/', topic: 'Queue' }
];

async function scrapeQuestions() {
    let allQuestions = [];
    let idCounter = 1;

    for (const item of TOPICS) {
        try {
            console.log(`Scraping ${item.topic} from ${item.url}...`);
            const { data } = await axios.get(item.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);

            const content = $('.entry-content');
            console.log(`HTML Length: ${data.length}`);
            console.log(`Found .entry-content: ${content.length > 0}`);
            console.log(`Number of paragraphs: ${$('.entry-content p').length}`);

            if (content.length === 0) {
                console.log("Structure mismatch: .entry-content not found. Dumping body classes...");
                console.log($('body').attr('class'));
            }
            const text = $(el).text().trim();
            // 1. Identify Question
            if (text.match(/^\d+\./)) {
                const questionText = text.replace(/^\d+\.\s*/, '');
                let options = [];
                let answer = '';
                let explanation = '';

                // 2. Scan siblings for Options and Answer
                // Iterate through next siblings until we hit another question or end
                let next = $(el).next();
                let safeguard = 0;

                while (next.length && safeguard < 10) {
                    const nextText = next.text().trim();
                    // If we hit the next question, stop
                    if (next.is('p') && nextText.match(/^\d+\./)) break;

                    // Check for options (a) ... b) ...)
                    if (nextText.includes('a)')) {
                        // Simple split by a), b), c), d)
                        // This is rough but often works for simple text scraping
                        options.push(nextText);
                    }

                    // Check for Answer/Explanation container
                    if (next.hasClass('collapseomatic_content') || nextText.includes('Answer:')) {
                        const ansMatch = nextText.match(/Answer:\s*([a-d])/i);
                        if (ansMatch) answer = ansMatch[1];

                        const expMatch = nextText.match(/Explanation:\s*(.+)/s);
                        if (expMatch) explanation = expMatch[1].trim();
                    }

                    next = next.next();
                    safeguard++;
                }

                // Fallback: if options array is just one big string, that's okay for now, user can refine.
                // If we found a question and an answer, we add it. 
                // Sanfoundry usually puts options in the immediate next paragraph.

                if (answer) {
                    allQuestions.push({
                        id: idCounter++,
                        topic: item.topic,
                        question: questionText,
                        options: options.length > 0 ? options : ["Check Source"],
                        correctAnswer: answer,
                        explanation: explanation || "No explanation provided"
                    });
                }
            }
        });

    } catch (error) {
        console.error(`Failed to scrape ${item.topic}:`, error.message);
    }
}

// Format as TypeScript file
const fileContent = `
export interface Question {
    id: number;
    topic: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export const QUIZ_DATA: Question[] = ${JSON.stringify(allQuestions, null, 4)};
`;

fs.writeFileSync(OUTPUT_FILE, fileContent);
console.log(`Saved ${allQuestions.length} questions to ${OUTPUT_FILE}`);
}

scrapeQuestions();
