/**
 * 聊天建议管理器
 * */
export default class ChatSuggestionsWorker {
    searchSuggestions;//聊天建议dom

    suggestions = [];//当前聊天建议列表
    constructor(searchSuggestions) {
        this.searchSuggestions = searchSuggestions;

        //当被点击时发送消息
        searchSuggestions.onclick = (event)=>{
            if(event.target.parentElement===searchSuggestions){
                if(searchSuggestions.style.opacity==="1"){
                    this.onSend(event.target.innerText);
                }
            }
        }

        //滚动到底部显示收聊天建议
        // 添加滚动事件监听器
        window.addEventListener("scroll", ()=>{
            // 获取文档的高度和滚动距离
            let docHeight = document.body.scrollHeight;
            let scrollPos = window.scrollY;
            // 如果滚动到底部，显示元素，否则隐藏元素
            if (scrollPos + window.innerHeight >= docHeight - 25) {
                searchSuggestions.style.opacity = '1';
            } else {
                searchSuggestions.style.opacity = '0';
            }
        });
        searchSuggestions.style.opacity = '1';//设置聊天建议显示
    }

    //重置聊天建议到初始状态
    /**
     * @param suggestions 建议消息数组 [消息1，消息2]
     * */
    set(suggestions) {
        this.clear();
        this.suggestions = suggestions;
        suggestions.forEach((s) => {
            let a = document.createElement('a');
            a.innerHTML = s;
            this.searchSuggestions.appendChild(a);
        });
    }

    /**
     * 获取聊天建议列表
     * @return {string[]}
     */
    get(){
        return this.suggestions;
    }

    //清空聊天建议
    clear(){
        this.suggestions = [];
        this.searchSuggestions.innerHTML = '';
    }

    /**
     * 需要重写
     * 当用户选择发生这条消息时触发
     * @param text 用户选择的文本
     * */
    onSend(text) {
        console.debug(`onSend方法没有被重写！,用户发送'${text}'`);
    }
}