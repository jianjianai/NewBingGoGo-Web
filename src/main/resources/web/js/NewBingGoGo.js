import ChatSuggestionsWorker from './module/ChatMessage/ChatSuggestionsWorker.js'
import CueWordWorker from './module/CueWordWorker.js'
import ParserReturnWorker from './module/ChatMessage/ParserReturnWorker.js'
import TitleWorker from './module/TitleWorker.js'
import ChatModeSwitchingWorker from './module/ChatModeSwitchingWorker.js'
import WindowScrollingWorker from "./module/WindowScrollingWorker.js";
import BingChat from './module/BingChat/BingChat.js';
import SwitchWorker from "./module/SwitchWorker.js";
import ChatRecordWorker from "./module/ChatRecord/ChatRecordWorker.js";
import ChatFirstMessages from "./module/BingChat/ChatFirstMessages.js";
import ChatOptionsSets from "./module/BingChat/ChatOptionsSets.js";
import nBGGFetch from "./module/nBGGFetch.js";
import {LoadAnimation} from "./module/aToos/AToos.js";

/**
 * 给bingChat加载服务器配置
 * @param bingChat {BingChat} 要加载配置的BingChat
 * @param serverConfig {Object} 配置的json
 */
function bingChatLoadServerConfig(bingChat,serverConfig){
    if(serverConfig){
        let firstMessages = serverConfig["firstMessages"];
        if( Array.isArray(firstMessages) && firstMessages.length>0  ){
            bingChat.chatFirstMessages.bingmMessages = firstMessages;
        }
        let firstProposes = serverConfig["firstProposes"];
        if(Array.isArray(firstProposes) && firstProposes.length>0){
            bingChat.chatFirstMessages.bingProposes = firstProposes;
        }
    }
}

/**
 * 给dom元素加载服务器配置
 * @param h1 {HTMLElement}
 * @param h2 {HTMLElement}
 * @param p {HTMLElement}
 * @param serverConfig {Object}
 */
function domLoadServerConfig(h1,h2,p,serverConfig){
    if (!serverConfig){
        return;
    }
    function hasShow(element,text){
        if(element){
            if (text){
                element.innerText = text;
                element.style.opacity = '1';
            }else {
                element.style.opacity = '0';
            }
        }
    }
    hasShow(h1,serverConfig['h1']);
    hasShow(h2,serverConfig['h2']);
    hasShow(p,serverConfig['p']);
}

//页面加载完成之后执行
window.addEventListener('load',async ()=>{
    //窗口更新滚动
    new WindowScrollingWorker(document.getElementById('chat'));

    //加载服务器配置
    let serverConfig
    try{
        serverConfig = (await (await nBGGFetch("./resource/config.json")).json());
    }catch (error){
        console.warn(error);
    }
    domLoadServerConfig(
        document.getElementById("server-h1"),
        document.getElementById("server-h2"),
        document.getElementById("server-p"),
        serverConfig
    )

    const bingChat = new BingChat(new ChatFirstMessages(),new ChatOptionsSets()); //聊天对象 BingChat 对象
    bingChatLoadServerConfig(bingChat,serverConfig);


    //加载需要用到的对象
    const chatSuggestionsManager = new ChatSuggestionsWorker(
        document.getElementById('SearchSuggestions')//聊天建议dom
    );
    const parserReturnMessage = new ParserReturnWorker(
        document.getElementById('chat'),
        chatSuggestionsManager
    );
    const chatModeSwitchingManager = new ChatModeSwitchingWorker(
        document.body,
        document.getElementById('chatTypeChoseCreate'),
        document.getElementById('chatTypeChoseBalance'),
        document.getElementById('chatTypeChoseAccurate'),
        document.getElementById('chatTypeDiv')
    );

    const cueWordManager = new CueWordWorker(
        document.getElementById("cueWord-selects-list"),//提示词列表dom
        document.getElementById("cueWord-selected"),//已选择的提示词mod
        document.getElementById("cueWord-search-input")//提示词搜索输入框dom
    );
    const titleManager = new TitleWorker(
        document.getElementById('goGoSubtitle')
    );

    const inputMaxSwitch = new SwitchWorker(
        document.getElementById("expand"),
        document.getElementById("tail")
    );

    //聊天记录
    const chatRecordWorker = new ChatRecordWorker(
        bingChat,
        chatModeSwitchingManager,
        chatSuggestionsManager,
        parserReturnMessage,
        document.getElementById('ChatRecordsListDiv'),
        document.getElementById('ChatRecordsServer')
    );

    //聊天记录显示和关闭显示的开关
    const chatRecordShowSwitch = new SwitchWorker(
        document.getElementById('showChatRecords'),
        document.getElementById('ChatRecordsListDivOut'),
        (ch)=>{
            if(ch){
                chatRecordWorker.updateList();
            }
        }
    );


    //获取需要用到的元素
    const restart_button = document.getElementById('restart');
    const input_text = document.getElementById('input');
    const send_button = document.getElementById('send');


    //定义需要用到的变量
    let returnMessage; //聊天返回对象
    let isSpeaking = false; //是否正在接收消息
    let previewMessageID = undefined; //预览消息id，如果没有预览消息就undefined


    //当打开聊天记录时
    chatRecordWorker.onOpenChatRecord = (event)=>{
        if(isSpeaking){
            event.isCanExecute =false;
            alert("请等待本次对话结束。")
            return;
        }
        if (returnMessage) {
            returnMessage.close();
            returnMessage = undefined;
        }
    }

    //回车键发送 ctrl+回车换行
    input_text.addEventListener('keydown', (event) => {
        //如果是展开状态就使用默认换行逻辑
        if (inputMaxSwitch.open) {
            return;
        }
        if (event.key === 'Enter' && !event.altKey) {
            event.preventDefault();
            //调用发送消息的函数
            onSend();
        } else if (event.key === 'Enter' && event.altKey) {
            event.preventDefault();
            // 插入换行符s
            input_text.value += "\n";
        }
    });

    /**重置聊天框和聊天建议到初始状态 */
    async function reSetStartChatMessage() {
        parserReturnMessage.restart(await bingChat.chatFirstMessages.nextStartMessage());
        chatSuggestionsManager.set(await bingChat.chatFirstMessages.nextStartProposes());
        titleManager.restart();
    }
    chatModeSwitchingManager.onChatTypeChange = (type,isUser)=>{
        if(isUser){
            reSetStartChatMessage().then();
        }
    };


    /**正在创建聊天 */
    function isAskingToMagic() {
        isSpeaking = true;
        titleManager.onCreating();
        send_button.value = '施法中.';
        chatSuggestionsManager.clear()
    }

    /**bing正在回复 */
    function isSpeakingStart(sendText) {
        isSpeaking = true;
        if (sendText) {
            titleManager.setPageTitleText(sendText);
            titleManager.onAnswering(sendText);
        }else {
            titleManager.onSending()
        }
        send_button.value = '响应中.';
        chatSuggestionsManager.clear();
    }

    /**bing回复结束 */
    function isSpeakingFinish() {
        send_button.value = '发送';
        titleManager.waitingNext();
        isSpeaking = false;
    }

    /**
     * 发送消息
     * @param text {string}
     * */
    async function send(text) {
        if (isSpeaking) {
            return;
        }
        chatModeSwitchingManager.hide();
        parserReturnMessage.setMyChat(text,previewMessageID,false);
        previewMessageID = undefined;
        if (!bingChat.isStart()) {
            isAskingToMagic();
            try {
                await bingChat.start(chatModeSwitchingManager.chatType);
            }catch (error){
                console.warn(error);
                parserReturnMessage.addError(error.message);
                isSpeakingFinish();
                if(window.location.protocol==="chrome-extension:"){
                    if(error.type==='NoLogin'){
                        parserReturnMessage.addNoLogin();
                    }else if (error.type==='NoPower'){
                        parserReturnMessage.addNoPower();
                    }else if(error.theType === "cf-mitigated"){
                        let reUrl = error.theData;
                        if(reUrl){
                            let rUrl = new URL(reUrl);
                            let myUrl = new URL(location.href);
                            myUrl.searchParams.set("ChatMode",chatModeSwitchingManager.chatType);
                            myUrl.searchParams.set("sendMessage",text);
                            rUrl.searchParams.set("redirect",myUrl.toString());
                            window.location.href = rUrl.toString();
                        }
                    }
                }
                return;
            }
        }
        try {
            isSpeakingStart();
            returnMessage = await bingChat.sendMessage(text, parserReturnMessage.getOnMessageFun((even)=>{
                if (even.type==='close'||even.type==='close-accident'||even.type==='error') {
                    isSpeakingFinish();
                    //保存聊天记录
                    if(chatRecordWorker.isOpen()){
                        chatRecordWorker.save();
                    }
                }
            }));
            isSpeakingStart(text);
        }catch (error){
            console.warn(error);
            isSpeakingFinish();
            parserReturnMessage.addError(error.message);
        }
    }
    chatSuggestionsManager.onSend = send;

    /**
     * 提示词改变也预览
     * */
    cueWordManager.onChange = ()=>{
        onPreview();
    }

    /**
     * 获取消息
     * */
    function getSendMessage(){
        let text = input_text.value;
        //连接提示词
        return  cueWordManager.getCutWordString(text);
    }

    /**
     * 当预览时候
     * */
    function onPreview(){
        previewMessageID = parserReturnMessage.setMyChat(getSendMessage(),previewMessageID,true);
        input_update_input_text_sstyle_show_update();
    }

    /**
     * 当发送时候
     * */
    function onSend(){
        if (isSpeaking) {
            return;
        }
        let text = getSendMessage();
        //清空输入框
        input_text.value = '';
        //清空提示词
        cueWordManager.clearCutWordString();

        //显示逻辑
        input_update_input_text_sstyle_show_update({ target: input_text });
        if (!text) {
            alert('什么都没有输入呀！');
            return;
        }

        //发送
        send(text).then();

        //关闭大输入框
        inputMaxSwitch.open = false;
    }
    send_button.onclick = onSend;


    //开始新主题
    restart_button.onclick = () => {
        if (returnMessage) {
            returnMessage.close();
            returnMessage = undefined;
        }
        bingChat.end();
        isSpeakingFinish();
        reSetStartChatMessage().then();
        chatModeSwitchingManager.show();
        chatRecordWorker.close();
        chatRecordWorker.updateList();
    };


    //发送按钮出现逻辑
    function input_update_input_text_sstyle_show_update() {
        if (getSendMessage()) {
            send_button.style.opacity = '1';
        } else {
            send_button.style.opacity = '0';
        }
    }
    input_text.addEventListener("input", ()=>{
        onPreview();
    });





    input_update_input_text_sstyle_show_update();
    cueWordManager.loadcueWorld().then();
    LoadAnimation.loaded(document.getElementById('load'));


    await reSetStartChatMessage();
    //如果有发送第一条消息的参数
    let url = new URL(window.location.href);
    let sendMessage = url.searchParams.get("sendMessage");
    if(sendMessage){
        send(sendMessage).then()
        url.searchParams.delete("sendMessage");
        window.history.pushState('','',url.toString());
    }
});








