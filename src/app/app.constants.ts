import { environment } from '../environments/environment';

export const constants = {
    apiUrl: environment.production ? 'https://db-polling.herokuapp.com/' : 'http://localhost:3000',
    answerTypes: {
        binary: 'binary',
        rating: 'rating',
        checkbox: 'checkbox',
        radioButton: 'radioButton',
        yesNoMaybe: 'yesNoMaybe',
        slider: 'slider'
    },
    statusTypes: {
        open: 'open',
        terminated: 'terminated',
        deleted: 'deleted'
    }
}