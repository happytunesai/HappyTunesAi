const express = require('express');
const fs = require('fs').promises;
const { Configuration, OpenAIApi } = require("openai");
const app = express();

const GPT_MODE = process.env.GPT_MODE;
const HISTORY_LENGTH = process.env.HISTORY_LENGTH;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

let file_context = "You are a helpful Twitch Chatbot.";
const messages = [{role: "system", content: file_context}];

if (!GPT_MODE || !HISTORY_LENGTH || !OPENAI_API_KEY) {
  console.error("Please set all required environment variables");
  process.exit(1);
}

app.use(express.json({extended: true, limit: '1mb'}));

app.all('/', (req, res) => {
  console.log("Just got a request!");
  res.send('Yo!');
});

(async () => {
  try {
    const data = await fs.readFile("./file_context.txt", 'utf8');
    console.log("Reading context file...");
    if (GPT_MODE === "CHAT") {
      console.log("Adding context file as system level message for the agent.");
      messages[0].content = data;
    } else {
      console.log("Adding context file in front of user prompts.");
      file_context = data;
    }
    console.log(file_context);
  } catch (err) {
    console.error("Error reading context file", err);
  }
})();

app.get('/gpt/:text', handleChatRequest);

async function handleChatRequest(req, res) {
  //The agent should recieve Username:Message in the text to identify conversations with different users in his history. 
    
  const text = req.params.text;
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);

  try {
    if (GPT_MODE === "CHAT") {
      //CHAT MODE EXECUTION
      const agent_response = await handleChatMode(openai, text);
      res.send(agent_response);
    } else {
      //PROMPT MODE EXECUTION
      const agent_response = await handlePromptMode(openai, text);
      res.send(agent_response);
    }
  } catch (error) {
    console.error("Error handling request", error);
    res.send("Something went wrong. Try again later!");
  }
}

async function handleChatMode(openai, text) {
  // implementation details...
}

async function handlePromptMode(openai, text) {
  // implementation details...
}

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
