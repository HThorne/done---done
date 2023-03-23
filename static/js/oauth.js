// Pulled and edited from oauth-base.html

/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '348082355065-ghndkd0dserle2v34n4lbmkamsm3sjoi.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDoDns2vq9faPJbE10iVsLsmdLM8xRgvBI';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/tasks';

let tokenClient;
let gapiInited = false;
let gisInited = false;


/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
});
gapiInited = true;
maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
});
gisInited = true;
maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
if (gapiInited && gisInited) {
    // document.getElementById('authorize_button').style.visibility = 'visible';
}
}
