interface Answer {
    option: string,
    answer: string
}

interface Question {
    _id: string,
    text: string,
    answers: Answer[],
    answer?: string,
    answerType: string
}

export class Response {
    questions: Question[];
    for: string;
}