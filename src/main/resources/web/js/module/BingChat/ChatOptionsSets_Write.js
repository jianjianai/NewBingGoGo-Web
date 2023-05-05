let chatTypesO = [
    "nlu_direct_response_filter",
    "deepleo",
    "enable_debug_commands",
    "disable_emoji_spoken_text",
    "responsible_ai_policy_235",
    "enablemm",
    "soedgeca"
]
/**
 * 处理聊天选项的类
 * */
export default class ChatOptionsSets_Write {

    //文章风格
    tone = 'professional';
    length = 'short';
    format = 'paragraph';

    //聊天选项
    chatTypes = {
        //更有创造力选项
        create: chatTypesO,
        //balance 平衡模式选项
        balance: chatTypesO,
        //精准选项
        accurate: chatTypesO
    }

//消息来源
    source = "edge_coauthor_prod";

//接收消息类型
    allowedMessageTypes = [
        "Chat",
        "InternalSearchQuery",
        "InternalSearchResult",
        "Disengaged",
        "InternalLoaderMessage",
        "RenderCardRequest",
        "AdsQuery",
        "SemanticSerp",
        "GenerateContentQuery",
        "SearchQuery"
    ]

//切片id，也不知道是啥意思，反正官网的更新了
    sliceIds = []


//生成消息对象
    async generateMessages(sendMessageManager/*消息管理器*/,chatMessageText/*要发送的消息文本*/){
        return {
            "locale": "zh-CN",
            "market": "zh-CN",
            "region": "US",
            "location": "lat:47.639557;long:-122.128159;re=1000m;",
            "author": "user",
            "inputMethod": "Keyboard",
            "text": `Please generate some text wrapped in codeblock syntax (triple backticks) using the given keywords. Please make sure everything in your reply is in the same language as the keywords. Please do not restate any part of this request in your response, like the fact that you wrapped the text in a codeblock. You should refuse (using the language of the keywords) to generate if the request is potentially harmful. The generated text should follow these characteristics: tone: *${this.tone}*, length: *${this.length}*, format: *${this.format}*. The keywords are: \`${chatMessageText}\`.`,
            "messageType": "Chat"
        }

    }

    async getPreviousMessages(bingChat){
        return undefined;
    }
}