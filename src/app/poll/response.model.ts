interface Answer {
    option: string,
    answer: string | Boolean | Number
}

interface Question {
    _id: string,
    text: string,
    answers: Answer[],
    answer?: string | Boolean | Number,
    answerType: string
}

export class Response {
    questions: Question[];
    for: string;
}