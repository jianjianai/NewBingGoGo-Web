/**
 * 聊天模式的切换的管理类
 * */
export default class ChatModeSwitchingWorker {
    static ChatType = {
        Creative:'Creative',
        Balanced:'Balanced',
        Precise:'Precise'
        //{"Creative","Balanced","Precise"}
    };
    backgroundDIV;   //背景div
    chatTypeChoseCreate;  //聊天选项有创造力按钮
    chatTypeChoseBalance; //聊天选项平衡按钮
    chatTypeChoseAccurate; //聊天选项精确按钮
    chatTypeDiv; //全部按钮的父元素
    //默认平衡
    _chatType = ChatModeSwitchingWorker.ChatType.Balanced;
    constructor(backgroundDIV,chatTypeChoseCreate,chatTypeChoseBalance,chatTypeChoseAccurate,chatTypeDiv) {
        this.backgroundDIV = backgroundDIV;
        this.chatTypeChoseCreate = chatTypeChoseCreate;
        this.chatTypeChoseBalance = chatTypeChoseBalance;
        this.chatTypeChoseAccurate = chatTypeChoseAccurate;
        this.chatTypeDiv = chatTypeDiv;

        let update = (chatType)=>{
            if(this._chatType === chatType){
                return;
            }
            let type = ChatModeSwitchingWorker.ChatType[chatType];
            if(!type){
                throw new Error("错误的聊天类型:"+chatType);
            }
            this._chatType = type;
            this.updateShow();
            this.onChatTypeChange(this._chatType,true);
        }

        //创造力模式
        chatTypeChoseCreate.onclick = () => {
            if (chatTypeDiv.style.opacity === '0') {
                return;
            }
            update(ChatModeSwitchingWorker.ChatType.Creative);
            //reSetStartChatMessage(ChatModeSwitchingWorker.ChatType.Creative);
        }
        //平衡模式
        chatTypeChoseBalance.onclick = () => {
            if (chatTypeDiv.style.opacity === '0') {
                return;
            }
            update(ChatModeSwitchingWorker.ChatType.Balanced);
            // reSetStartChatMessage(ChatModeSwitchingWorker.ChatType.Balanced);
        }
        //准确模式
        chatTypeChoseAccurate.onclick = () => {
            if (chatTypeDiv.style.opacity === '0') {
                return;
            }
            update(ChatModeSwitchingWorker.ChatType.Precise);
            // reSetStartChatMessage(ChatModeSwitchingWorker.ChatType.Precise);
        }


        let url = new URL(window.location.href);
        let chatMode = url.searchParams.get("ChatMode");
        if(chatMode){
            let type = ChatModeSwitchingWorker.ChatType[chatMode];
            if(type){
                this.chatType = type;
            }
        }
    }


    get chatType() {
        return this._chatType;
    }

    /**
     * @param chatType 聊天选项，ChatModeSwitchingWorker.ChatType中的一种
     * */
    set chatType(chatType) {
        if(this._chatType === chatType){
            return;
        }
        let type = ChatModeSwitchingWorker.ChatType[chatType];
        if(!type){
            throw new Error("错误的聊天类型:"+chatType);
        }
        this._chatType = type;
        this.updateShow();
        this.onChatTypeChange(this._chatType,false);
    }

    /**
     * 更新显示
     * */
    updateShow(){
        if (this.chatType === ChatModeSwitchingWorker.ChatType.Creative) {//有创造力的
            this.chatTypeChoseCreate.classList.add('Chose');
            this.chatTypeChoseBalance.classList.remove('Chose');
            this.chatTypeChoseAccurate.classList.remove('Chose');
            this.backgroundDIV.classList.remove('b','c');
            this.backgroundDIV.classList.add('a');
        } else if (this.chatType === ChatModeSwitchingWorker.ChatType.Balanced) {//平衡
            this.chatTypeChoseCreate.classList.remove('Chose');
            this.chatTypeChoseBalance.classList.add('Chose');
            this.chatTypeChoseAccurate.classList.remove('Chose');
            this.backgroundDIV.classList.remove('a','c');
            this.backgroundDIV.classList.add('b');
        } else if (this.chatType === ChatModeSwitchingWorker.ChatType.Precise) {//精确的
            this.chatTypeChoseCreate.classList.remove('Chose');
            this.chatTypeChoseBalance.classList.remove('Chose');
            this.chatTypeChoseAccurate.classList.add('Chose');
            this.backgroundDIV.classList.remove('a','b');
            this.backgroundDIV.classList.add('c');
        } else {
            console.warn("错误的聊天类型", this.chatType);
        }
    }


    /**
     * 需要重写
     * 当聊天类型改变时调用
     * @param chatType 新的聊天类型
     * @param isUser true:是用户通过点击按钮触发   false:chatType=xxx赋值触发
     * */
    onChatTypeChange(chatType,isUser){
        console.debug(`onChatTypeChange方法没有被重写！,聊天类型切换到'${chatType}'`);
    }

    /**
     * 显示聊天模式选项
     * */
    show(){
        this.chatTypeDiv.style.opacity = '1';
    }

    /**
     * 隐藏聊天模式选项
     * */
    hide(){
        this.chatTypeDiv.style.opacity = '0';
    }
}