const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const readline = require('readline');
const { stdin, stdout } = require("process");

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const userInterface = readline.createInterface({
    input: stdin,
    output: stdout
})

const techniques = {
    basic: {
        name: "Basic",
        systemMessage: "You are a helpful assistant."
    },
    expert: {
        name: "Expert",
        systemMessage: "You are an expert in the field being discussed. Provide detailed, technical answers drawing on advanced concepts. Use precise terminology where appropriate."
    },
    cot: {
        name: "Chain of Thought",
        systemMessage: "You are a helpful assistant. When answering questions, walk through your thinking step-by-step before providing a final answer."
    },
    fewShot: {
        name: "Few-shot Learning",
        systemMessage: "You are a helpful assistant. Follow the format of these examples:\n\nQuestion: What is machine learning?\nAnswer: Machine learning is a branch of artificial intelligence that focuses on building systems that learn from data.\n\nQuestion: What is a neural network?\nAnswer: A neural network is a computing system inspired by biological neural networks, consisting of interconnected nodes that process information."
    }
};

let currentTechnique = techniques.basic;

let messagesHistory = [
    { role: "system", content: currentTechnique.systemMessage }
]

function showMenu() {
    console.log("\n=== Prompt Engineering Techniques ===");
    Object.values(techniques).forEach(technique => {
        const marker = technique.name === currentTechnique.name ? "* " : " ";
        console.log(`${marker}${technique.name}`)
    })
    console.log("\nCommands");
    console.log("  /technique [name] - Change prompting technique");
    console.log("  /clear - Clear conversation history");
    console.log("  /exit - Exit the program")
    console.log("\nEnter your message or command")
}

function processCommand(input) {
    const parts = input.trim().split(" ")
    const command = parts[0].toLowerCase();

    if (command === "/technique"){
        const techniqueName = parts.slice(1).join(" ");
        console.log("Attempting to switch to technique:", techniqueName);
        console.log("Available techniques:", Object.values(techniques).map(t => t.name));
        
        const technique = Object.values(techniques).find(t => {
            console.log(`Comparing: '${t.name.toLowerCase()}' with '${techniqueName.toLowerCase()}'`);
            return t.name.toLowerCase() === techniqueName.toLowerCase();
        });

        if (technique) {
            currentTechnique = technique;
            messagesHistory = [
                { role: "system", content: currentTechnique.systemMessage }
            ];
            console.log(`Switched to ${technique.name} technique`);
        } else {
            console.log("\nTechnique is not available. Available techniques:");
            Object.values(techniques).forEach(t => console.log(`- ${t.name}`));
        }
        return true;
    } else if (command === "/clear") {
        messagesHistory = [
            { role: "system", content: currentTechnique.systemMessage}
        ];
        console.log("\nConversation history cleared");
        return true;
    } else if (command === "/exit") {
        console.log("\nGoodbye");
        process.exit(0);
    }
    return false;
}

async function sendMessage(content) {
    messagesHistory.push({ role: "user", content})

    try {
        console.log("\nThinking...");
        const completion = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messagesHistory
        });
        const responseContent = completion.choices[0].message.content;
        console.log(`\nAI: ${responseContent}`);

        messagesHistory.push({
            role: "assistant",
            content: responseContent
        });
    } catch(error) {
        console.error("\nError:", error.message);
        if (error.code === 'ENOTFOUND') {
            console.error("Network error: Please check your internet connection");
        }
    }
}

// Start the application
console.log('Welcome to the Prompt Engineer Tester!');
console.log("This tool lets you experiment with different prompting techniques.");
showMenu();

userInterface.on("line", async (input) => {
    if (input.startsWith("/")) {
        if (!processCommand(input)) {
            console.log("Unknown Command")
        }
    } else if (input.trim()) {
        await sendMessage(input);
    }
    
})