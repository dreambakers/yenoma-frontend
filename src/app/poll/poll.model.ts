interface Question {
    text: string,
    options: string[],
    answerType: string;
    decimalPlaces?: number;
    minValue?: number;
    maxValue?: number;
    showHints?: boolean;
    editMode?: boolean;
}

export class Poll {
    title: string;
    description?: string;
    questions: Question[];
    status: string;
    privateNote?: string;
    allowNames: boolean;
    allowComments: boolean;
    password?: string;
    _id?: string;
    shortId?: string;
    inactiveComment?: string;
    activeComment?: string;
    terminatedAt?: Date;
    automaticNumbering?: Boolean;
}