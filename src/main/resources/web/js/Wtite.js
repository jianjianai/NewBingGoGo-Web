import ParserReturnWorker from './module/ChatMessage/ParserReturnWorker.js'
import TitleWorker from './module/TitleWorker.js'
import BingChat from './module/BingChat/BingChat.js';
import ChatFirstMessages from "./module/BingChat/ChatFirstMessages.js";
import ChatOptionsSets_Write from "./module/BingChat/ChatOptionsSets_Write.js";

/*控制按钮组选择，当选中新的按钮时回调函数*/
function selectButtonFunRetrun(buttonGroup, returnFun) {
    for (let i = 0; i < buttonGroup.length; i++) {
        let the = buttonGroup[i];
        the.onclick = () => {
            for (let j = 0; j < buttonGroup.length; j++) {
                buttonGroup[j].classList.remove("selected");
            }
            the.classList.add("selected");
            returnFun(the);
        };
    }
}

//页面加载完成之后执行
window.addEventListener('load',()=>{

    const chatOptionsSets_Write = new ChatOptionsSets_Write();
    const chatFirstMessages = new ChatFirstMessages();
    chatFirstMessages.bingmMessages = ['输入文章标题即可开始创作！'];
    const bingChat = new BingChat(chatFirstMessages,chatOptionsSets_Write); //聊天对象 BingChat 对象

    const parserReturnMessage = new ParserReturnWorker(
        document.getElementById('chat')
    );
    parserReturnMessage.restart = (firstBingMessage)=>{
        if(!firstBingMessage){
            parserReturnMessage.chatDiv.innerHTML = '';
            return;
        }
        parserReturnMessage.chatDiv.innerHTML = `
		<div class="bing">
			<div class="adaptiveCardsFatherDIV">
				<div class="textBlock markdown-body">
					${firstBingMessage}
				</div>
			</div>
		</div>
		`;
    }

    const titleManager = new TitleWorker(
        document.getElementById('goGoSubtitle')
    );
    titleManager.waitingNext = ()=>{
        titleManager.setSubtitleText("想创作什么呢？我来帮你！")
    }
    titleManager.restart= ()=>{
        titleManager.setSubtitleText("想创作什么呢？我来帮你！")
    }



    let toneSelectbuttns = document.querySelectorAll("#toneSelect>div");
    let formatSelecctbuttns = document.querySelectorAll("#formatSelecct>div");
    let lengthSelectbuttns = document.querySelectorAll("#lengthSelect>div");
    // 将按钮组添加
    chatOptionsSets_Write.tone = toneSelectbuttns[0].dataset.value;
    toneSelectbuttns[0].classList.add('selected');
    selectButtonFunRetrun(toneSelectbuttns, (re) => {
        chatOptionsSets_Write.tone = re.dataset.value;
    });
    chatOptionsSets_Write.format = formatSelecctbuttns[0].dataset.value;
    formatSelecctbuttns[0].classList.add('selected');
    selectButtonFunRetrun(formatSelecctbuttns, (re) => {
        chatOptionsSets_Write.format = re.dataset.value;
    });
    chatOptionsSets_Write.length = lengthSelectbuttns[0].dataset.value;
    lengthSelectbuttns[0].classList.add('selected');
    selectButtonFunRetrun(lengthSelectbuttns, (re) => {
        chatOptionsSets_Write.length = re.dataset.value;
    });


    const input_text = document.getElementById('input');
    const send_button = document.getElementById('send');


    //定义需要用到的变量
    let returnMessage; //聊天返回对象
    let isSpeaking = false; //是否正在接收消息


    /**重置聊天框和聊天建议到初始状态 */
    async function reSetStartChatMessage() {
        parserReturnMessage.restart(await bingChat.chatFirstMessages.nextStartMessage());
        titleManager.restart();
    }


    /**正在创建聊天 */
    function isAskingToMagic() {
        isSpeaking = true;
        titleManager.onCreating();
        send_button.value = '施法中.';
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
    }

    /**bing回复结束 */
    function isSpeakingFinish() {
        send_button.value = '发送';
        titleManager.waitingNext();
        isSpeaking = false;
    }

    async function send(text) {
        if (isSpeaking) {
            return;
        }
        parserReturnMessage.setMyChat(text);
        if (!bingChat.isStart()) {
            isAskingToMagic();
            try {
                await bingChat.start('Balanced');
            }catch (error){
                console.warn(error);
                parserReturnMessage.addError(error.message);
                isSpeakingFinish();
                if(window.location.protocol==="chrome-extension:"){
                    if(error.type==='NoLogin'){
                        parserReturnMessage.addNoLogin();
                    }else if (error.type==='NoPower'){
                        parserReturnMessage.addNoPower();
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
                }
            }));
            isSpeakingStart(text);
        }catch (error){
            console.warn(error);
            isSpeakingFinish();
            parserReturnMessage.addError(error.message);
        }
    }


    send_button.onclick = async ()=>{
        if (isSpeaking) {
            return;
        }
        let text = input_text.value;

        //显示逻辑
        if (!text) {
            alert('什么都没有输入呀！');
            return;
        }

        bingChat.end();
        parserReturnMessage.restart();
        //发送
        send(text).then();
    };



    reSetStartChatMessage().then();
});








