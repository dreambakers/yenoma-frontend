import { environment } from '../environments/environment';

export const constants = {
    version: '0.20',
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
        email: 'email',
        list: 'list'
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
        cookiePolicyClicked: "cookiePolicyClicked",
        imprintClicked: "imprintClicked",
        termsAndConditionsClicked: "termsAndConditionsClicked",
        feedbackClicked: "feedbackClicked",
        importSurveryClicked: "importSurveryClicked",
        logoutInitiated: "logoutInitiated",
        scrollPositionUpdated: "scrollPositionUpdated",
        idleTimeoutCount: "idleTimeoutCount",
        idleTimedOut: "idleTimedOut",
        importSurveyData: "importSurveyData",
        settingsTabChanged: "settingsTabChanged",
        subscriptionPaymentSuccessful: "subscriptionPaymentSuccessful",
    },

    options: {
        binary: [100, 0],
        yesNoMaybe: [100, 50, 0],
        rating: [100,75,50,25,0],
        dropdown: [100,90,80,70,60,50,40,30,20,10,0],
        smiley: [100, 50, 0,],
        radioButton: [100, 0],
        checkbox: [100, 0],
        text: [100, 0],
        email: [100, 0],
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
    },
    yenomaUrl: 'http://www.yenoma.com',
    shortenerUrl: 'http://ynm.de'
}