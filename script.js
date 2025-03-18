const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const readline = require("readline");

const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// Load environment variables from .env file
dotenv.config();

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is not set in .env file");
    process.exit(1);
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

userInterface.prompt()
userInterface.on("line", async input => {
    try {
        const completion = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: input
                }
            ]
        });
        console.log(completion.choices[0].message.content);
        userInterface.prompt()
    } catch (error) {
        console.error("Error:", error.message);
        if (error.code === 'ENOTFOUND') {
            console.error("Network error: Please check your internet connection");
        }
    }

})


    


