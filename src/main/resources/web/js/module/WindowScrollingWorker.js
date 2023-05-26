/**
 * 元素变化窗口滚动的处理类
 * */
export default class WindowScrollingWorker {
    /**
     * @param element 监听变化的父元素
     * */
    constructor(element) {
        // 当聊天更新时，如果窗口在底部则将窗口滚动到底部
        let isOnBottom = (window.scrollY + window.innerHeight >= document.body.scrollHeight-10);//标记页面是否在底部
        //监听页面变化
        let observer = new MutationObserver(()=>{
            //如果窗口变化前在底部则滚动到底部
            if(isOnBottom){
                window.scrollTo(0, document.body.scrollHeight);
            }
        });
        observer.observe(element, {
            childList: true,  // 观察目标子节点的变化，是否有添加或者删除
            attributes: true, // 观察属性变动
            subtree: true     // 观察后代节点，默认为 false
        });

        //当窗口滚动时判断是否在底部
        window.addEventListener("scroll", function() {
            if (window.scrollY + window.innerHeight >= document.body.scrollHeight-10) {
                isOnBottom = true;
            }else{
                isOnBottom = false;
            }
        });
    }
}

