/**
 * 处理返回消息的类
 * */
export default class ReturnMessage {
    closed = false;
    catWebSocket;
    onMessage;
    bingChating;
    //(WebSocket,function:可以不传)
    /**
     * @param catWebSocket {WebSocket} 聊天的ebSocket
     * @param lisin {function} 回调函数
     * @param bingChating {BingChating}
     */
    constructor(catWebSocket, lisin,bingChating) {
        this.bingChating = bingChating;
        this.catWebSocket = catWebSocket;
        this.onMessage = [(v) => {
            console.log(v)
        }];
        if ((typeof lisin) == 'function') {
            this.regOnMessage(lisin);
        }
        catWebSocket.onmessage = (mess) => {
            //console.log('收到', mess.data);
            let sss = mess.data.split('\u001e');
            for (let i = 0; i < sss.length; i++) {
                if (sss[i] === '') {
                    continue;
                }
                for (let j in this.onMessage) {
                    if ((typeof this.onMessage[j]) == 'function') {
                        try {
                            this.onMessage[j](JSON.parse(sss[i]), this);
                        } catch (e) {
                            console.warn(e)
                        }
                    }
                }
            }
        }
        catWebSocket.onclose = (event) => {
            for (let i in this.onMessage) {
                if ((typeof this.onMessage[i]) == 'function') {
                    try {
                        this.onMessage[i]({
                            type: 'close',
                            ok:this.closed,
                            mess: event
                        }, this);
                    } catch (e) {
                        console.warn(e)
                    }
                }
            }
        }
        catWebSocket.onerror = (mess) => {
            console.log(mess);
            for (let i in this.onMessage) {
                if ((typeof this.onMessage[i]) == 'function') {
                    try {
                        this.onMessage[i]({
                            type: 'error',
                            mess: mess
                        }, this);
                    } catch (e) {
                        console.warn(e)
                    }
                }
            }
        }
    }

    /**
     * 注册接收消息的监听器
     * @param theFun 回调函数
     */
    regOnMessage(theFun) {
        this.onMessage[this.onMessage.length] = theFun;
    }

    /**
     * 关闭当前聊天
     * */
    close(){
        this.closed = true;
        this.catWebSocket.close(1000,'ok');
    }
}