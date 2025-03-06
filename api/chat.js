// api/chat.js - For Vercel deployment
import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { AIMessage, HumanMessage, SystemMessage } from 'langchain/schema';

export const config = {
  runtime: 'edge',
};

export default async function POST(req) {
  try {
    const { messages } = await req.json();

    // Use environment variable for OpenAI API key
    const chatModel = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      streaming: true,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Add system message for diagnostic capabilities
    const systemMessage = new SystemMessage(
      `You are an advanced AI diagnostic assistant.
      Your goal is to help users identify issues by asking insightful follow-up questions.
      Use a friendly, professional tone and avoid medical advice that could be harmful.
      If the user shares an image, acknowledge it and ask for more details about what's visible.
      Always explain your reasoning process clearly.`
    );

    // Convert the messages to LangChain format
    const langchainMessages = messages.map((message) => {
      if (message.role === 'user') {
        return new HumanMessage(message.content);
      } else {
        return new AIMessage(message.content);
      }
    });

    // Add the system message at the beginning
    langchainMessages.unshift(systemMessage);

    const { stream, handlers } = LangChainStream();

    // Call the model and stream the response
    chatModel.call(langchainMessages, {}, [handlers]).catch(console.error);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
