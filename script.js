const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function main() {
    const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: "Hello, what is your name?"
            }
        ]
    });

    console.log(completion.choices[0].message.content);
}

main().catch(console.error);