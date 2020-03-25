interface Question {
    text: string,
    options: string[],
    answerType: string;
}

export class Poll {
    title: string;
    description: string;
    questions: Question[];
    status: string;
    privateNote: string;
}