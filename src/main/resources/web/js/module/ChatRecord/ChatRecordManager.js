/**
 * 处理聊天记录的类,
 * */
import ChatRecord from "./ChatRecord.js";

export default class ChatRecordManager {
    /**
     * 获取聊天记录列表。返回一个ChatRecord数组
     * @return ChatRecord[]
     * */
    static chatRecords(){
        let data = localStorage.chatRecords;
        let records =!!data?JSON.parse(data):{};
        delete records.nextIndex;
        let chatRecords = [];
        for(let theIn in records){
            chatRecords.push(ChatRecord.loadFromObj(records[theIn],theIn));
        }
        return chatRecords;
    }

    /**
     * 获取一个聊天记录
     * @param id 聊天id
     */
    static get(id){
        let data = localStorage.chatRecords;
        let records =!!data?JSON.parse(data):{};
        let theDate = records[id];
        return !!theDate?ChatRecord.loadFromObj(theDate,id):undefined;
    }
    /**
     * 添加一个聊天记录,添加之后聊天记录会被赋予id属性
     * */
    static add(chatRecord){
        if(chatRecord.id){
            throw new Error("此聊天记录已经被添加到聊天记录，请使用update方法更新");
        }
        let data = localStorage.chatRecords;
        let records =!!data?JSON.parse(data):{};
        if(!records.nextIndex){
            records.nextIndex = 1;
        }
        chatRecord.id = records.nextIndex;
        records[records.nextIndex++] = chatRecord.saveToObj();
        console.log(records)
        localStorage.chatRecords = JSON.stringify(records);
        return chatRecord;
    }
    /**
     * 删除一个聊天记录
     * */
    static delete(chatRecord){
        if(!chatRecord.id){
            return;
        }
        let data = localStorage.chatRecords;
        let records =!!data?JSON.parse(data):{};
        records[chatRecord.id] = undefined;
        localStorage.chatRecords = JSON.stringify(records);
    }
    /**
     * 更新一个聊天记录
     * */
    static update(chatRecord){
        if(!chatRecord.id){
            throw new Error("使用create创建的聊天记录，不可以使用update方法。");
        }
        let data = localStorage.chatRecords;
        let records =!!data?JSON.parse(data):{};
        records[chatRecord.id] = chatRecord.saveToObj();
        localStorage.chatRecords = JSON.stringify(records);
    }
}
