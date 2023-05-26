import SendMessageManager from "./SendMessageManager.js";
import nBGGFetch from "../nBGGFetch.js";
import ReturnMessage from "./ReturnMessage.js";
import RandomAddress from "../RandomAddress.js";

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
   // invocationId = 1;
    // historySendMessage = [];


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
        // bingChating.invocationId = bingChating.sendMessageManager.invocationId;
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
        // bingChating.invocationId = sendMessageManager.invocationId;
        return bingChating;
    }

    /**
     * @param message {String} 发送的消息
     * @param onMessage {function(Object,ReturnMessage)} 当收到消息时的回调函数
     * @return {ReturnMessage}
     * @throws {Error}
     */
    async sendMessage(message, onMessage) {
        // //记录，和分配id
        // if(id){
        //     this.sendMessageManager.invocationId = id;
        // }else {
        //    // this.addHistorySendMessage(this.invocationId,message);
        //     this.sendMessageManager.invocationId = this.invocationId;
        //     this.invocationId++;
        // }

        let restsrstUrl;
        if(window.location.protocol==="chrome-extension:"){
            let re = await nBGGFetch(`${window.location.origin}/sydney/ChatHubUrl`);
            restsrstUrl = await re.text();
        }else {
            let p = new URLSearchParams();
            p.append("randomAddress",RandomAddress.randomAddress);
            restsrstUrl = `${window.location.origin.replace('http','ws')}/sydney/ChatHub?${p.toString()}`;
        }
        try {
            let chatWebSocket = new WebSocket(restsrstUrl);
            let returnMessage = new ReturnMessage(chatWebSocket, onMessage, this);
            chatWebSocket.onopen = () => {
                this.sendMessageManager.sendShakeHandsJson(chatWebSocket);
            }
            //当连接打开时发送
            let onopen = async (even)=>{
                if('{}'===JSON.stringify(even)){
                    await this.sendMessageManager.sendJson(chatWebSocket,{"type":6});
                    await this.sendMessageManager.sendChatMessage(chatWebSocket, message);
                    returnMessage.outOnMessage(onopen);
                }
            };
            returnMessage.regOnMessage(onopen);
            //ping回复
            returnMessage.regOnMessage(async (even)=>{
                if (even["type"] === 6) {
                    await this.sendMessageManager.sendJson(chatWebSocket,{"type":6});
                }
            });
            return returnMessage;
        } catch (e) {
            console.warn(e);
            if(e.isNewBingGoGoError){
                throw new Error(e.message);
            }else {
                throw new Error("无法连接到web服务器，请刷新页面重试:" + e.message);
            }
        }
    }

    // /**
    //  * 添加一条历史消息
    //  * @param id {number}
    //  * @param message {String}
    //  * */
    // addHistorySendMessage(id,message){
    //     this.historySendMessage[this.historySendMessage.length] = {id:id,message:message};
    //     return this.historySendMessage[this.historySendMessage.length-1];
    // }
    //
    // /**
    //  * 获取最后一条历史消息
    //  * @return {{id:number,message:string}}
    //  * */
    // getLastSendMessage(){
    //     if(this.historySendMessage.length<1){
    //         return undefined;
    //     }
    //     return this.historySendMessage[this.historySendMessage.length-1];
    // }
}