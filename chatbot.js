const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const readline = require("readline");
const { stdin, stdout } = require("process");

dotenv.config();

const userInterface = readline.createInterface({
    input: stdin,
    output: stdout
})



const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


// Define the methods for the chatbot
const methods = {
    basic: {
        name: "Basic",
        systemMessage: "You are ChatGPT, a large language model developed by OpenAI. Provide helpful, accurate, and clear responses to all inquiries."
    },
    expertCoder: {
        name: "Expert Programmer",
        systemMessage: "You are an expert coding assistant proficient in various programming languages and software development best practices. Deliver precise, detailed explanations, and efficient code solutions."

    },
    humor: {
        name: "Humorous",
        systemMessage: "You are a humorous AI with a knack for witty banter and clever jokes. Infuse your responses with lighthearted humor while ensuring your answers remain informative and engaging."

    },

    business: {
        name: "Business",
        systemMessage: "You are a professional business consultant with deep expertise in corporate strategy, finance, and management. Provide formal, concise, and data-driven advice tailored for a business audience."
    }
}

let currentMode = methods.basic;

let messagesHistory = [
    {role: "system", content: currentMode.systemMessage}
]

function displayMenu() {
    // Display the menu for the user to choose from
    const methodName = Object.values(methods).map(method => method.name.trim());

    console.log("\nWelcome to AI Chatbot Flow. Here to answer all your inquiries!");
    console.log(`\nYour current method is ${currentMode.name}`)
    console.log("\nChoose one of the methods that you would like to choose below!");
    console.log(`\nMethods: \n`);
    Object.values(methods).forEach(method => {
        const marker = method.name === currentMode.name ? "-> " : "";
        if (marker) {
            console.log(`${marker}${method.name.trim()}`)
        } else {

            console.log(`- ${marker}${method.name.trim()}`)
        }
    })
    console.log("\nCommands:");
    console.log("- Type '/method MethodName' to switch methods during chat");
    console.log("\nYour choice: ")
}

function chooseMethod(choice) {
   // First, find the method
   const method = Object.values(methods).find(m => m.name
    .toLowerCase() === choice.toLowerCase()
);
    if (method) {
        currentMode = method;
        console.log(`User has chosen ${currentMode.name} Method`)
    } else {
        console.log("Error. Please make a valid choice.");
    }
}

userInterface.on("line", async (input) => {
    const userInput = input.trim();

    // Check if the user input starts with a slash, indicating a command
    if (userInput.startsWith("/")) {
        const parts = userInput.split(" ");  // Split into parts
        const command = parts[0];  // First part is the command ("/method")
        const methodName = parts.slice(1).join(" ");  // Rest is the method name

        if (command === "/method") {
            // Try to switch methods
            chooseMethod(methodName);
            // Maybe update message history?
            messagesHistory = [
                { role: "system", content: currentMode.systemMessage }
            ];
        } else {
            console.log("Unknown command. Available commands:");
            console.log("- /method [MethodName]");
        }
    } else {
        // Regular chat message
        await sendMessage(userInput);
    }
});

async function sendMessage(content) {
    // After Selection of method, display message
    if (messagesHistory.length === 0) {
        console.log("Hi. My name is AI Chatbot. Your wonderful assistant. What do you want to talk about?");
    }

    messagesHistory.push({ role: "user", content: content })
// Send the message to the AI
    try {
        console.log("\nAI is typing...")
        const completion = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messagesHistory
        })

        const responseFromAi = completion.choices[0].message.content
        console.log(`\n[${new Date().toLocaleTimeString()}] AI:`, responseFromAi);

        messagesHistory.push({ role: "assistant", content: responseFromAi})


    } catch (error) {
        console.error("Error: ", error.message)
    }
}

displayMenu();

