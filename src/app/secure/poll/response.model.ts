interface Answer {
    answer: string | Boolean | Number
}

interface Question {
    _id: string,
    answers: Answer[],
    answer?: string | Boolean | Number,
    answerType: string
}

export class Response {
    questions: Question[];
    for: string;
    name?: string;
    comments?: string;
}