interface Question {
    text: string,
    options: string[],
    answerType: string;
    decimalPlaces?: number;
    minValue?: number;
    maxValue?: number;
    showHints?: boolean;
    editMode?: boolean;
    limits?: { minChecks?: Number, maxChecks?: Number };
    allowOtherAnswer?: boolean;
    radioToDropdown?: boolean;
    collapsed?: boolean;
    additionalText?: String;
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
    thankYouTitle?: string;
    thankYouMessage?: string;
}