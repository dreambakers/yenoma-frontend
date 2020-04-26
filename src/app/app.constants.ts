import { environment } from '../environments/environment';

export const constants = {
    apiUrl: environment.production ? 'https://db-polling.herokuapp.com' : 'http://localhost:3000',
    answerTypes: {
        binary: 'binary',
        rating: 'rating',
        checkbox: 'checkbox',
        radioButton: 'radioButton',
        yesNoMaybe: 'yesNoMaybe',
        slider: 'slider',
        smiley: 'smiley',
        text: 'text',
        dropdown: 'dropdown',
        value: 'value'
    },
    statusTypes: {
        open: 'open',
        terminated: 'terminated',
        deleted: 'deleted'
    },
    dropdownOptions: [
        0,1,2,3,4,5,6,7,8,9,10
    ]
}