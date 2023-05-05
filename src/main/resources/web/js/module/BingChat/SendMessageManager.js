/**
 * 处理发送消息的类
 * */
export default class SendMessageManager {
    bingChat;
    invocationId;
    conversationId;
    clientId;
    conversationSignature;
    optionsSets;


    /**
     * 从对象创建
     * @param bingChat 对象
     * @param obj 对象
     * */
    static crateFromObj(bingChat,obj){
        return new SendMessageManager(
            bingChat,
            obj.conversationId,
            obj.clientId,
            obj.conversationSignature,
            obj.optionsSets,
            obj.invocationId
        );
    }

    /**
     * 将自己保存到obj
     * */
    saveToObj(){
        return{
            conversationId:this.conversationId,
            clientId:this.clientId,
            conversationSignature:this.conversationSignature,
            optionsSets:this.optionsSets,
            invocationId:this.invocationId
        }
    }

    /**
     * @param bingChat BingChat对象
     * @param conversationId 会话id
     * @param clientId 客户端id
     * @param conversationSignature 签名id
     * @param theChatType 聊天类型，默认平衡 accurate 或 balance 或 create
     * @param invocationId 对话id，也就是第几次对话
     */
    constructor(bingChat,conversationId, clientId, conversationSignature,theChatType,invocationId) {
        this.bingChat = bingChat;
        this.invocationId = !!invocationId?invocationId:1;
        this.conversationId = conversationId;
        this.clientId = clientId;
        this.conversationSignature = conversationSignature;
        this.optionsSets = !!theChatType?theChatType:'balance';
    }

    /**
     * 发送json数据
     * @param chatWebSocket
     * @param json
     * @return Promise<void>
     */
    async sendJson(chatWebSocket, json) {
        let go = JSON.stringify(json) + '\u001e';
        await chatWebSocket.send(go);
        console.log('发送', go)
    }
    /**
     * 获取用于发送的握手数据
     * @param chatWebSocket WebSocket
     * @return {Promise<void>}
     */
    async sendShakeHandsJson(chatWebSocket) {
        await this.sendJson(chatWebSocket, {
            "protocol": "json",
            "version": 1
        });
    }

    /***
     * 获取用于发送的聊天数据
     * @param chatWebSocket WebSocket
     * @param chat sreing 聊天消息
     * @return {Promise<void>}
     */
    async sendChatMessage(chatWebSocket, chat) {
        let optionsSets = this.bingChat.chatOptionsSets.chatTypes[this.optionsSets];
        if(!optionsSets){
            optionsSets = this.bingChat.chatOptionsSets.chatTypes.balance;
            console.warn("不存在的ChatType",this.optionsSets);
        }

        let json = {
            "arguments": [{
                "source": this.bingChat.chatOptionsSets.source,
                "optionsSets": optionsSets,
                "allowedMessageTypes": this.bingChat.chatOptionsSets.allowedMessageTypes,
                "sliceIds": this.bingChat.chatOptionsSets.sliceIds,
                "verbosity": "verbose",
                "traceId": this.getUuidNojian(),
                "isStartOfSession": (this.invocationId <= 1),
                "message": await this.bingChat.chatOptionsSets.generateMessages(this,chat),
                "conversationSignature": this.conversationSignature,
                "participant": {
                    "id": this.clientId
                },
                "conversationId": this.conversationId,
                "previousMessages": (this.invocationId <= 1) ? await this.bingChat.chatOptionsSets.getPreviousMessages(this.bingChat) : undefined
            }],
            "invocationId": this.invocationId.toString(),
            "target": "chat",
            "type": 4
        };
        await this.sendJson(chatWebSocket, json);
        this.invocationId++;
    }
    getUuidNojian() {
        return URL.createObjectURL(new Blob()).split('/')[3].replace(/-/g, '');
    }
}