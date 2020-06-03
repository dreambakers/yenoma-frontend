import { environment } from '../environments/environment';

export const constants = {
    version: '0.12',
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
    emitterKeys: {
        home: 'home',
        arrange: 'arrange',
        add: 'add',
        create: 'create',
        preview: 'preview',
        updateNavbarProps: 'updateNavbarProps',
        toggleSidebar: 'toggleSidebar',
        logoutClicked: 'logoutClicked',
        changeNavbarTitle: 'changeNavbarTitle',
        resetNavbar: 'resetNavbar',
        updateNavbarLabels: 'updateNavbarLabels',
        highlightKeys: "highlightKeys",
        languageChanged: "languageChanged",
        screeenSizeChanged: "screeenSizeChanged",
        aboutClicked: "aboutClicked",
        changePasswordClicked: "changePasswordClicked",
        logoutInitiated: "logoutInitiated",
        languageChangeClicked: "languageChangeClicked"
    },

    options: {
        binary: ['yes', 'no'],
        yesNoMaybe: ['yes', 'maybe', 'no'],
        rating: [5,4,3,2,1],
        dropdown: [10,9,8,7,6,5,4,3,2,1,0],
        smiley: ['happy','medium', 'sad',],
        text: ['filled', 'unfilled'],
        radioButton: ['true', 'false'],
        checkbox: ['true', 'false']
    },

    dialogWidth: {
        mobile: '280px',
        desktop: '400px'
    }
}