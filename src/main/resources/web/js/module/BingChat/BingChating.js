import SendMessageManager from "./SendMessageManager.js";
import nBGGFetch from "../aToos/nBGGFetch.js";
import ReturnMessage from "./ReturnMessage.js";

/**
 * 用于发送聊天消息和接受消息的对象
 * 使用 BingChat 创建
 */
export default class BingChating {
    /**
     * 对象
     */
    bingChat;
    sendMessageManager;

    /**
     * @param bingChat {BingChat}对象
     * @param charID {String} 会话id
     * @param clientId {String} 客户端id
     * @param conversationSignature {String} 会话签名
     * @param theChatType {"Creative","Balanced","Precise"} 聊天类型 Precise 或 Balanced 或 Creative
     * @param invocationId {number} 对话id，就是这是第几次对话 可以不传
     * */
    static create(bingChat, charID, clientId, conversationSignature, theChatType, invocationId){
        let bingChating = new BingChating();
        bingChating.bingChat = bingChat;
        bingChating.sendMessageManager = new SendMessageManager(bingChat,charID, clientId, conversationSignature,theChatType,invocationId);
        return bingChating;
    }
    /**
     * @param bingChat {BingChat}对象
     * @param sendMessageManager {SendMessageManager} 对象
     * */
    static createIn(bingChat, sendMessageManager){
        let bingChating = new BingChating();
        bingChating.bingChat = bingChat;
        bingChating.sendMessageManager = sendMessageManager;
        return bingChating;
    }

    /**
     * @param message {String} 发送的消息
     * @param onMessage {function} 当收到消息时的回调函数
     * @return {ReturnMessage}
     * @throws {Error}
     */
    async sendMessage(message, onMessage) {
        let restsrstUrl;
        if(window.location.protocol==="chrome-extension:"){
            let re = await nBGGFetch(`${window.location.origin}/sydney/ChatHubUrl`);
            restsrstUrl = await re.text();
        }else {
            restsrstUrl = `${window.location.origin.replace('http','ws')}/sydney/ChatHub`;
        }
        try {
            let chatWebSocket = new WebSocket(restsrstUrl);
            chatWebSocket.onopen = () => {
                this.sendMessageManager.sendShakeHandsJson(chatWebSocket);
                this.sendMessageManager.sendChatMessage(chatWebSocket, message);
            }
            return new ReturnMessage(chatWebSocket, onMessage, this);
        } catch (e) {
            console.warn(e);
            if(e.isNewBingGoGoError){
                throw new Error(e.message);
            }else {
                throw new Error("无法连接到web服务器，请刷新页面重试:" + e.message);
            }
        }
    }
}