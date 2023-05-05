import DateFormat from "../aToos/DateFormat.js";

/**
 * 一个聊天记录类
 * */
export default class ChatRecord{
    id;
    name; //聊天记录名称
    creationTime; //聊天记录创建时间
    content = { //聊天记录内容

    };
    /**
     * 从obj加载
     * @param obj 对象
     * @param id id
     * @return {ChatRecord}
     */
    static loadFromObj(obj,id){
        let chatRecord = new ChatRecord();
        chatRecord.id = id;
        chatRecord.name = obj.name;
        chatRecord.creationTime = obj.creationTime;
        chatRecord.content = obj.content;
        return chatRecord;
    }
    /**
     * 创建一个聊天记录
     * @param content obj 要存储的内容
     * @param name 聊天记录名称
     * @return ChatRecord
     * */
    static create(name,content){
        let chatRecord = new ChatRecord();
        chatRecord.name = name;
        chatRecord.content = content;
        chatRecord.creationTime = DateFormat.format(new Date());
        return chatRecord;
    }

    /**
     * 保存为obj
     * @return {{creationTime, name, content}}
     */
    saveToObj(){
        return {
            name:this.name,
            creationTime:this.creationTime,
            content:this.content
        }

    }
}