import { environment } from '../environments/environment';

export const constants = {
    version: '0.16',
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
        value: 'value',
        email: 'email'
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
        languageChangeClicked: "languageChangeClicked",
        scrollPositionUpdated: "scrollPositionUpdated",
        idleTimeoutCount: "idleTimeoutCount",
        idleTimedOut: "idleTimedOut"
    },

    options: {
        binary: ['yes', 'no'],
        yesNoMaybe: ['yes', 'maybe', 'no'],
        rating: [5,4,3,2,1],
        dropdown: [10,9,8,7,6,5,4,3,2,1,0],
        smiley: ['happy','medium', 'sad',],
        text: ['unfilled', 'filled'],
        radioButton: ['true', 'false'],
        checkbox: ['true', 'false'],
        email: ['unfilled', 'filled'],
    },

    dialogWidth: {
        mobile: '280px',
        desktop: '400px'
    },

    idleTimouts: {
        // 2.8 hours
        idle: 10200,
        timeout: 10,
        ping: 120
    }
}