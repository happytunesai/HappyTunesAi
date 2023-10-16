const express = require('express')
const request = require('request')
const app = express()
const fs = require('fs');
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

// load env variables
let GPT_MODE = process.env.GPT_MODE
let HISTORY_LENGTH = process.env.HISTORY_LENGTH
let OPENAI_API_KEY = process.env.OPENAI_API_KEY
let MODEL_NAME = process.env.MODEL_NAME

if (!GPT_MODE) {
    GPT_MODE = "CHAT"
}
if (!HISTORY_LENGTH) {
    HISTORY_LENGTH = 5
}
if (!OPENAI_API_KEY) {
    console.log("No OPENAI_API_KEY found. Please set it as environment variable.")
}
if (!MODEL_NAME) {
    MODEL_NAME = "gpt-4"
}

// init global variables
const MAX_LENGTH = 399
let file_context = "You are a helpful Twitch Chatbot."
let last_user_message = ""

const messages = [
    {role: "system", content: "You are a helpful Twitch Chatbot."}
];

console.log("GPT_MODE is " + GPT_MODE)
console.log("History length is " + HISTORY_LENGTH)
console.log("OpenAI API Key:" + OPENAI_API_KEY)
console.log("Model Name:" + MODEL_NAME)

app.use(express.json({extended: true, limit: '1mb'}))

app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})

if (process.env.GPT_MODE === "CHAT"){

    fs.readFile("./file_context.txt", 'utf8', function(err, data) {
        if (err) throw err;
        console.log("Reading context file and adding it as system level message for the agent.")
        messages[0].content = data;
    });

} else {

    fs.readFile("./file_context.txt", 'utf8', function(err, data) {
        if (err) throw err;
        console.log("Reading context file and adding it in front of user prompts:")
        file_context = data;
        console.log(file_context);
    });

}

// NEUER CODE: Funktion zum Laden und Verarbeiten der Songliste
async function loadAndProcessSongList() {
    try {
        const data = await readFile('./songlist.json', 'utf8'); // Stellen Sie sicher, dass der Dateipfad korrekt ist
        const json = JSON.parse(data);

        // Verarbeiten der Daten und Erstellen von Song-Objekten, Header-Zeile überspringen
        const songs = json.data.slice(1).map(row => ({
            title: row[0].replace(/<[^>]+>/g, ''),
            artist: row[1].replace(/<[^>]+>/g, ''),
            genre: row[2].replace(/<[^>]+>/g, ''),
            playtime: row[3].replace(/<[^>]+>/g, ''),
            public: row[4] === "1"
        }));

        return songs; // oder jede andere Logik, um die gewünschten Daten aus dem JSON zu extrahieren
    } catch (err) {
        console.error('Fehler beim Lesen der Songliste:', err);
        return [];
    }
}

// NEUER CODE: Endpunkt zum Abrufen der Songs
app.get('/songs', async (req, res) => {
    const songs = await loadAndProcessSongList();
    res.json(songs);
});

// ... [Hier beginnt der Originalcode wieder]

app.get('/gpt/:text', async (req, res) => {
    // ... [Der Rest des Originalcodes bleibt hier unverändert]
    // ... [bis zum Ende der Datei]
})
app.all('/continue/', (req, res) => {
    // ... [Der Rest des Originalcodes bleibt hier unverändert]
})
app.listen(process.env.PORT || 3000)
