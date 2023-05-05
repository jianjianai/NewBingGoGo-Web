/**
 * 聊天记录的工作类
 * */
import ChatRecordManager from "./ChatRecordManager.js";
import BingChating from "../BingChat/BingChating.js";
import SendMessageManager from "../BingChat/SendMessageManager.js";
import ChatRecord from "./ChatRecord.js";

export default class ChatRecordWorker{
    /***
     * 当前使用的聊天记录
     */
    userChatRecord;

    /**
     * 聊天对象
     */
    bingChat;
    /**
     * 聊天模式切换对象
     */
    chatModeSwitchingWorker;
    /**
     * 聊天建议对象
     */
    chatSuggestionsWorker;
    /**
     * 消息显示对象
     */
    parserReturnWorker;
    /**
     * 装聊天记录的div
     */
    chatRecordDIV;
    /**
     * 聊天记录命名框
     * */
    deitDiv;

    /**
     * 新建聊天记录按钮
     * */
    newChatRecordDIV;



    constructor(bingChat, chatModeSwitchingWorker, chatSuggestionsWorker, parserReturnWorker, chatRecordDIV,newChatRecordDIV) {
        this.bingChat = bingChat;
        this.chatModeSwitchingWorker = chatModeSwitchingWorker;
        this.chatSuggestionsWorker = chatSuggestionsWorker;
        this.parserReturnWorker = parserReturnWorker;
        this.chatRecordDIV = chatRecordDIV;
        this.newChatRecordDIV = newChatRecordDIV;

        //创建聊天记录
        this.newChatRecordDIV.addEventListener('click',()=>{
            this.crate('新的聊天');
            this.updateList();
        });

        this.deitDiv = document.createElement('div');
        this.deitDiv.classList.add("edit");
        this.deitDiv.addEventListener('click',(event)=>{
            event.stopPropagation();
        })


        this.deitDiv.rename = document.createElement('input');
        this.deitDiv.rename.type = 'text';
        this.deitDiv.rename.addEventListener('change',(event)=>{
            event.stopPropagation();
            if (this.userChatRecord){
                this.rename(this.deitDiv.rename.value);
                this.updateList();
            }
        });


        this.deitDiv.idDiv = document.createElement('div');
        this.deitDiv.idDiv.classList.add('id');

        this.deitDiv.timeDiv = document.createElement('div');
        this.deitDiv.timeDiv.classList.add('time');

        this.deitDiv.deleteDiv = document.createElement('div');
        this.deitDiv.deleteDiv.classList.add('delete');
        this.deitDiv.deleteDiv.innerHTML = '✖';
        this.deitDiv.deleteDiv.addEventListener('click',(event)=>{
            event.stopPropagation();
            this.delete();
            this.updateList();
        })


        this.deitDiv.appendChild(this.deitDiv.idDiv)
        this.deitDiv.appendChild(this.deitDiv.rename)
        this.deitDiv.appendChild(this.deitDiv.timeDiv)
        this.deitDiv.appendChild(this.deitDiv.deleteDiv)
    }

    /**
     * 更新聊天记录列表
     */
    updateList(){
        this.chatRecordDIV.innerHTML = '';
        let recordList = ChatRecordManager.chatRecords();
        recordList.forEach((v)=>{
                                        //这里用==不用===，因为需要转换比较
            if(this.userChatRecord && (v.id == this.userChatRecord.id)){
                this.deitDiv.idDiv.innerHTML = v.id;
                this.deitDiv.rename.value = v.name;
                this.deitDiv.timeDiv.innerHTML = v.creationTime;
                this.chatRecordDIV.appendChild(this.deitDiv);
            }else {
                let div =  document.createElement('div');
                div.innerHTML = `
<div class="id">${v.id}</div>
<div class="name">${v.name}</div>
<div class="time">${v.creationTime}</div>`;

                div.addEventListener('click',()=>{
                    this.openByChatRecord(v);
                    this.updateList();
                });
                this.chatRecordDIV.appendChild(div);
            }
        })
    }

    /**
     * 打开聊天记录
     * @param id 聊天记录的id
     * @throws Error
     * */
    open(id){
        let chatRecord = ChatRecordManager.get(id);
        if(!chatRecord){
            throw Error(`id为${id}的聊天记录不存在。`);
        }
        this.openByChatRecord(chatRecord);
    }
    /**
     * 打开聊天记录
     * @param chatRecord 聊天记录对象
     * */
    openByChatRecord(chatRecord){
        let obj = {
            chatRecord:chatRecord,
            isCanExecute:true
        };
        this.onOpenChatRecord(obj);
        if(!obj.isCanExecute){
            return;
        }
        this.userChatRecord = chatRecord;
        let date = chatRecord.content;
        this.chatModeSwitchingWorker.chatType = date.chatOptionsSets;
        if(date.chatData){
            this.bingChat.bingChating = BingChating.createIn(
                this.bingChat,
                SendMessageManager.crateFromObj(this.bingChat,date.chatData)
            )
            this.chatModeSwitchingWorker.hide();
        }else{
            this.bingChat.bingChating = undefined;
            this.chatModeSwitchingWorker.show();
        }
        this.chatSuggestionsWorker.set(date.chatSuggestions);
        this.parserReturnWorker.chatDiv.innerHTML = date.chatDivHtml;
        this.deitDiv.value = chatRecord.name;
    }
    /**
     * 将当前信息保存到当前聊天记录
     * */
    save(){
        if(!this.userChatRecord){
            throw Error(`需要先创建一个聊天记录才能保存哦！`);
        }
        this.userChatRecord.content = this.getData();
        ChatRecordManager.update(this.userChatRecord);
    }
    /**
     * 创建聊天记录
     * @param name 聊天记录名称
     * */
    crate(name){
        this.userChatRecord = ChatRecord.create(name,{});
        this.deitDiv.value = name;
        this.userChatRecord.content = this.getData();
        ChatRecordManager.add(this.userChatRecord);
    }

    /**
     * 获取data
     */
    getData(){
        let data = {};
        if(this.bingChat.isStart()){
            data.chatData = this.bingChat.bingChating.sendMessageManager.saveToObj();
        }
        data.chatOptionsSets = this.chatModeSwitchingWorker.chatType;
        data.chatSuggestions = this.chatSuggestionsWorker.get();
        data.chatDivHtml = this.parserReturnWorker.chatDiv.innerHTML;
        return  data;
    }

    /**
     * 重命名当前聊天记录
     * */
    rename(name){
        if(!this.userChatRecord){
            throw Error(`需要先创建一个聊天记录才能重命名哦！`);
        }
        this.userChatRecord.name  = name;
        ChatRecordManager.update(this.userChatRecord);
    }


    /**
     * 删除当前打开的聊天记录
     */
    delete(){
        if(!this.userChatRecord){
            throw new Error("当前没有打开任何聊天记录。");
        }
        ChatRecordManager.delete(this.userChatRecord);
        this.userChatRecord = undefined;
    }

    /**
     * 关闭当前打开的聊天记录
     * */
    close(){
        this.userChatRecord = undefined;
    }

    /**
     * 是否打开了聊天记录
     * */
    isOpen(){
        return !!this.userChatRecord;
    }

    /**
     * 当打开新聊天记录时
     */
    onOpenChatRecord(event){
        console.log('没被实现',event);
    }


}