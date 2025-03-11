import dotenv from "dotenv";
import {ChatOpenAI} from "@langchain/openai";
import path from "node:path";
import {tool} from "@langchain/core/tools";
import {z} from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const envPath = path.resolve(__dirname, "./.env")
dotenv.config({path: envPath});

const main = async () => {
    const chatBoxSchema = z.object({
        candidateId: z.string().describe('候选人ID，表示要给哪个候选人发送消息'),
        messageType: z.enum(['TEXT', 'RESUME_REQUEST']).describe('消息类型：TEXT 表示向候选人发送文本消息，RESUME_REQUEST 表示向候选人请求简历'),
        messageContent: z.string().optional().describe('发个候选人的消息内容：当 messageType 为 TEXT 时，messageContent 为文本消息内容。当 messageType 为 RESUME_REQUEST 时，messageContent 为空')
    })

    // 参考文档 https://js.langchain.com/docs/how_to/custom_tools/
    const chatBoxTool = tool(
        async ({candidateId, messageType, messageContent}) => {
            console.log('messageType', messageType)
            console.log('candidateId', candidateId)
            console.log('messageContent', messageContent)
            return '消息发送成功'
        },
        {
            name: 'chatBox',
            description: '在聊天室中给候选人发一条消息（仅当要和候选人聊天时才调用）。',
            schema: chatBoxSchema,
            responseFormat: 'content'
        }
    )

    const  agentModel = new ChatOpenAI({
        model: "deepseek-v3-241226",
        temperature: 0.05,
    })

    const agent = createReactAgent({
        llm: agentModel,
        tools: [chatBoxTool],
    })

    const response = await  agent.invoke({
        messages: [
            new SystemMessage(`
            你的角色是一个招聘者，目标是跟潜在候选人聊天以获取他的简历。
            接下来会有一段跟候选人的聊天对话，你需要根据聊天内容，判断是和他发一条消息，还是请求其简历，或者是直接不用回复。
            请务必遵守以下原则：
                1. 最多调用一次 chatBox 工具。
                2. 聊天消息不要超过20字
                3. 给候选人发消息时，语气口语化一点，避免让候选人认为你是ai
                4. 语气保持中立，不要进行价值判断，不要给出任何承诺。比如：不要说这个岗位适合/不适合候选人，不要说候选人的简历很好/很差等，不要说稍后会联系候选人。
                5. 如果情况你处理不了，不要回复候选人，直接结束任务
                6. 发完消息后，你需要结束。
            `),
            new HumanMessage(`
                下面有一段候选人和招聘者的对话列表，你需要按这个原则进行处理：没打招呼先打个招呼，接着索要其简历。
                注意：如果你发现聊天记录中招聘者已经索要过简历，你不要和候选人聊天，也不需要索要简历。什么都不要不做，直接结束。
                这是对话列表："候选人A：我不找工作"
            `)
        ]
    })

    // console.log('agent response', response)

}

main()
