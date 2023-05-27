import generateImages from "../generateImages.js";
import nBGGFetch from "../nBGGFetch.js";
import CookieID from "../CookieID.js";
import RandomAddress from "../RandomAddress.js";

/**
 * 解析消息的对象
 * */
export default class ParserReturnWorker {
    chatDiv;//放置消息的div
    chatSuggestionsWorker;//聊天建议工作对象
    /**
     * @param chatSuggestionsWorker 聊天建议工作对象
     * @param chatDiv 放置聊天消息的div
     * */
    constructor(chatDiv,chatSuggestionsWorker) {
        this.chatSuggestionsWorker = chatSuggestionsWorker;
        this.chatDiv = chatDiv;
        this.chatDiv.parserReturnWorker = this;//用于调试
        // this.chatDiv.CookieID = CookieID;//用于调试

        //用于更新消息卡片
        window.addEventListener('message',(event)=>{
            let data = event.data;
            if (data.type==="AnswerCardDimensionUpdate" ||
                data.type==="AnswerCardResize"){
                let cardF = document.getElementById(data.data.iframeid);
                let card = document.getElementById(data.data.iframeid+"Card");
                if(card){
                    card.style.width = data.data.width+'px';
                    card.style.height = data.data.height+'px';
                }
                if(cardF){
                    if(data.data.width<0||data.data.height<=0){
                        cardF.classList.add("onshow");
                    }else {
                        cardF.classList.remove("onshow")
                    }
                }

            }
        });

        //复制粘贴
        chatDiv.addEventListener('click', async function(event) {
            if (event.target.classList.contains("copy-bingcat")) {
                let messageElement = event.target.parentElement.parentElement.getElementsByClassName('textBlock')[0];
                await navigator.clipboard.writeText(messageElement.innerText);
            }
            if(event.target.classList.contains("copy-bingcat-markdown")){
                let messageElement = event.target.parentElement.parentElement.getElementsByClassName('textBlock')[0];
                await navigator.clipboard.writeText(messageElement.dataset.the_markdown_text);
            }
            if(event.target.classList.contains("code-copy")){
                let messageElement = event.target.parentElement;
                await navigator.clipboard.writeText(messageElement.innerText);
            }
        });

    }
    /**
     (id,元素的tag,父元素,创建时顺便添加的class:可以多个)
     获取一个指定id的元素如果没用就在服元素创建这个元素
     */
    getByID(id, tag, father) {
        let t = document.getElementById(id);
        if (!t) {
            t = document.createElement(tag);
            t.id = id;
            for (let i = 3; i < arguments.length; i++) {
                if (arguments[i]) {
                    t.classList.add(arguments[i]);
                }
            }
            father.appendChild(t);
        }
        return t;
    }
    getByClass(className, tag, father) {
        let t = father.getElementsByClassName(className)[0];
        if (!t) {
            t = document.createElement(tag);
            t.classList.add(className);
            for (let i = 3; i < arguments.length; i++) {
                if (arguments[i]) {
                    t.classList.add(arguments[i]);
                }
            }
            father.appendChild(t);
        }
        return t;
    }

    /**
     * 清空全部消息，回到初始状态
     * @param firstBingMessage 首条聊天消息，
     * */
    restart(firstBingMessage){
        this.chatDiv.innerHTML = `
		<div class="bing">
			<div class="adaptiveCardsFatherDIV">
				<div class="textBlock markdown-body">
					${firstBingMessage}
				</div>
				<div class="throttling">
					0 / 0
				</div>
			</div>
		</div>
		`;
    }

    /**
     * 添加一条自己的消息
     * @param message {string} 更新的消息，如果不传就是删除这条消息
     * @param id {string} 更新消息的id，如果不传则是添加一条，如果传就更新这条消息
     * @param preview {boolean} 是否是预览
     * @return {string} uid
     */
    setMyChat(message, id,preview) {
        if(!id){
            id = `my_${new Date().getTime()}`;
        }
        let go = this.getByID(id,'div',this.chatDiv);
        go.classList.add('my');
        if(!message){
            go.remove();
            return id;
        }
        if(preview){
            go.classList.add('preview');
        }else {
            go.classList.remove('preview');
        }
        let bobo = this.getByClass('bobo','pre',go);
        bobo.innerText = message;
        bobo.classList.add('markdown-body');
        return id;
    }


    //(string)
    addError(message) {
        let go = document.createElement('div');
        go.classList.add('error');
        go.innerHTML = message; //需要用innerHTML，因为可能会插入带有html的内容
        this.chatDiv.appendChild(go);
    }

    addNoPower() {
        let go = document.createElement('div');
        go.classList.add('NoPower');
        go.innerText = '>>> 点击尝试申请加入候补名单获取NewBing聊天权限 <<<';
        this.chatDiv.appendChild(go);
        go.onclick = async () => {
            if (go.geting) {
                return;
            }
            go.geting = true;
            go.innerHTML = '正在请求申请加入候补名单..';
            try {
                await nBGGFetch(`${window.location.origin}/msrewards/api/v1/enroll?publ=BINGIP&crea=MY00IA&pn=bingcopilotwaitlist&partnerId=BingRewards&pred=true&wtc=MktPage_MY0291`);
                go.innerHTML = '请求成功！请刷新页面重试，如果无权限使用请等待几天后重试。'
            }catch (error){
                go.innerHTML = '发生错误：' + error.message;
            }
        }
    }

    addNoLogin(){
        let go = document.createElement('a');
        go.classList.add('NoPower');
        go.innerText = '>>> 点击跳转到登录页面 <<<';
        go.style.display = 'block';
        this.chatDiv.appendChild(go);
        go.href = 'https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&id=264960&wreply=https%3A%2F%2Fcn.bing.com%2Fsecure%2FPassport.aspx%3Fedge_suppress_profile_switch%3D1%26requrl%3Dhttps%253a%252f%252fcn.bing.com%252f%253fwlexpsignin%253d1&wp=MBI_SSL&lc=2052&aadredir=1';
        go.target = '_blank';
    }

    test(test) {
        this.porserArguments(test.arguments);
    }

    throttling = {
        "maxNumUserMessagesInConversation": 0,
        "numUserMessagesInConversation": 0
    };

    /**
     * 解析type2的item
     * @param item {Object}
     * @param returnMessage {ReturnMessage|undefined}
     * */
    porserType2Item(item,returnMessage){
        let chatDiv = document.getElementById('chat');
        if(item.result){
            let result = item.result;
            if(result.value==='Success'){

            }else if (result.value === 'Throttled') {
                this.addError(result.message);
                this.addError('24消息请求数达到了限制！');
            }else if(result.value === 'CaptchaChallenge'){
                this.addError(result.message);
                if(window.location.protocol==="chrome-extension:"){
                    this.addError('当前账号请求过多，需要通过机器人检查！无法通过请等待24小时后再试。');
                    this.addError('正在尝试通过验证，需要科学上网环境。');
                    this.addCAPTCHA();
                    this.addError('若无法通过可尝试验证码验证');
                }else {
                    this.addError(`当前账号请求过多，需要通过机器人检查！第${CookieID.cookieID}个账号`);
                }
                let rURL = new URL(window.location.href);
                rURL.searchParams.set("cookieID",CookieID.cookieID);
                rURL.searchParams.set("randomAddress",RandomAddress.randomAddress);
                let p = new URLSearchParams();
                p.append("cookieID",CookieID.cookieID);
                p.append("redirect",rURL.href);
                p.append("randomAddress",RandomAddress.randomAddress)
                this.addError(`<p><a href="./ChatImgCAPTCHA.html?${p.toString()}">点击前往验证</a></p>`)
            }else{
                this.addError(result.message);
                this.addError('发生未知错误！');
            }
        }
        if (item.throttling) {
            this.throttling = item.throttling;
        }
        if (item.messages) {
            let nextFather = this.getByID(item.requestId, 'div', chatDiv, 'bing');
            this.porserMessages(item.messages, nextFather);
            if (!nextFather.innerHTML) {
                nextFather.remove();
            }
        }

    }

    /**
     * 添加机器人检查验证
     * */
    addCAPTCHA() {
        let div = this.getByID(new Date().getTime()+'CAPTCHA','div',this.chatDiv);

        // let div = document.createElement('div');
        // document.getElementById('chat').appendChild(div);

        div.classList.add('CAPTCHAIframeDIV');
        let iframe = document.createElement('iframe');
        iframe.classList.add('CAPTCHAIframe');
        iframe.src = 'https://www.bing.com/turing/captcha/challenge';
        div.appendChild(iframe);
    }

    /**
     * 解析arguments
     * 解析聊天消息，将消息添加到页面
     * @param argumentss {Object}
     * @param returnMessage {ReturnMessage|undefined}
     * **/
    porserArguments(argumentss,returnMessage) {
        for (let i = 0; i < argumentss.length; i++) {
            this.porserType2Item(argumentss[i],returnMessage);
        }
    }

    /*
    解析messages
    */
    porserMessages(messages, father) {
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            if(message.author==='user'){
                continue;//不解析用户的消息
            }

            //解析adaptiveCards 也就是聊天消息部分 下面类型的都是带有adaptiveCards的
            if (!message.messageType && message.adaptiveCards) {//如果是正常的聊天消息
                let adaptiveCardsFatherDIV = this.getByID(message.messageId, 'div', father, 'adaptiveCardsFatherDIV');
                this.porserAdaptiveCards(message.adaptiveCards, adaptiveCardsFatherDIV);

                //解析sourceAttributions 也就是引用链接部分
                if (message.sourceAttributions) {
                    if (message.sourceAttributions.length > 0) {
                        let sourceAttributionsDIV = this.getByID(message.messageId + 'sourceAttributions', 'div', father, 'sourceAttributions');
                        this.porserSourceAttributions(message.sourceAttributions, sourceAttributionsDIV);
                    }
                }
                //解析suggestedResponses 建议发送的消息，聊天建议
                if (message.suggestedResponses) {
                    this.porserSuggestedResponses(message.suggestedResponses);
                }

            } else if (message.messageType === 'InternalSearchQuery') { //如果是收索消息
                let div = this.getByID(message.messageId, 'div', father, 'InternalSearchQuery');
                this.porserLineTextBlocks(message.text, div);

            } else if (message.messageType === 'InternalLoaderMessage') { //如果是加载消息
                let div = this.getByID(message.messageId, 'div', father, 'InternalLoaderMessage');
                this.porserLineTextBlocks(message.text, div);

            } else if (message.messageType === 'GenerateContentQuery') {//如果是生成内容查询
                let div = this.getByID(message.messageId, 'div', father, 'GenerateContentQuery');
                this.generateContentQuery(message, div);

            }else if (message.messageType === 'RenderCardRequest'){//渲染卡片请求，目前不知道有什么用
                this.renderCardRequest(message, father);

            }else if(message.messageType === 'Disengaged'){
                let div = this.getByID(message.messageId, 'div', this.chatDiv, 'error');
                div.innerHTML = `
            ${message.hiddenText}<br>聊天中断！试试开始新主题？
            `;

            }else if(message.contentOrigin === 'TurnLimiter'){
                this.addError(message.text);
                this.addError('聊天被限制了，试试开始新主题？');

            } else {
                console.log('发现一个另类message', JSON.stringify(message));
            }

        }
    }

    /*
    解析渲染卡片请求，暂时不知道如何解析这个请求,就先判断里面有没有内容吧！没有就不显示。
    */
    renderCardRequest(message,father){
        let messageId = message.messageId;
        if(father[messageId+'renderCardRequest']){//防止解析多次
            return;
        }
        father[messageId+'renderCardRequest'] = true;

        let url = 'https://www.bing.com/search?'
        let theUrls = new URLSearchParams();
        theUrls.append("showselans",1);
        theUrls.append("q",message.text);
        theUrls.append("iframeid",messageId);
        let src = url+theUrls.toString();

        let div = this.getByID(messageId, 'div', father, 'RenderCardRequest');
        div.classList.add("onshow");
        let iframe = document.createElement('iframe');
        iframe.id= messageId+"Card";
        iframe.role = 'presentation';
        iframe.src = src;
        div.appendChild(iframe);
    }


    /*
    解析generateContentQuery生成内容查询,目前是只有图片
    */
    generateContentQuery(message, father) {
        if(message.contentType==="IMAGE"){
            if(father.runed){//防止生成多次
                return;
            }
            father.runed = true;
            this.generateContentQueryImg(message, father).then();
        }else{
            console.log('发现一个另类generateContentQuery', JSON.stringify(message));
        }
    }

    /**
     * 解析图片生成目前是只有图片
     */
    async generateContentQueryImg(message, father){
        father.innerText = `正在生成’${message.text}‘的图片.`
        let imgs
        try {
            imgs = await generateImages(message.text,message.requestId,(v)=>{
                father.innerText = `正在生成’${message.text}‘的图片.${v}`
            });
        }catch (error){
            console.warn(error);
            father.innerHTML = error.message;
            return;
        }
        let theUrls = new URLSearchParams();
        theUrls.append('createmessage',message.text);
        father.innerHTML = '';
        let a = document.createElement("a");
        father.appendChild(a);
        imgs.forEach((v)=>{
            theUrls.append('imgs',v.img);
            let img = document.createElement("img");
            img.src = v.mImg;
            a.appendChild(img);
        });
        a.target = '_blank';
        a.href = './imgs.html?'+theUrls.toString();
    }

    /*
    解析adaptiveCards 聊天消息部分
    */
    porserAdaptiveCards(adaptiveCards, father) {
        for (let i = 0; i < adaptiveCards.length; i++) {
            let adaptiveCard = adaptiveCards[i];
            if (adaptiveCard.type === 'AdaptiveCard') {
                this.porserbody(adaptiveCard.body, father);
            } else {
                console.log('发现一个不是AdaptiveCard的adaptiveCard', JSON.stringify(adaptiveCard));
            }
        }

    }
    /**
     解析body adaptiveCards[].body这个部分
     */
    porserbody(bodys, father) {
        for (let i = 0; i < bodys.length; i++) {
            let body = bodys[i];
            if (body.type === 'TextBlock') {
                this.porserTextBlock(body, father);
            }else {
                console.log('发现一个不是TextBlock的body', JSON.stringify(body));
            }
        }
    }



    /**
     补全代码块，如果文本中有~~~开头却没有~~~结束则在最后补一个~~~，防止内容生成时闪烁
     */
    completeCodeBlock(makerdown){
        let to = function(regA,regB,add,makerdown){
            let falst = true;
            let arrs = makerdown.split('\n');
            for(let i=0;i<=arrs.length;i++){
                if(falst){
                    if(regA.test(arrs[i])){
                        falst = false;
                    }
                }else{
                    if(regB.test(arrs[i])){
                        falst = true;
                    }
                }
            }
            if(!falst){
                makerdown = makerdown+add;
            }
            return makerdown;
        }
        // console.log(out);
        return to(
            new RegExp('^~~~.*$'),
            new RegExp('^~~~( *)$'),
            '\n~~~',
            to(
                new RegExp('^```.*$'),
                new RegExp('^```( *)$'),
                '\n```',
                makerdown
            )
        );
    }

    renderMathInElementOptions ={
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: '$', right: '$', display: false},
            {left: "\\(", right: "\\)", display: false},
            {left: "\\begin{equation}", right: "\\end{equation}", display: true},
            {left: "\\begin{align}", right: "\\end{align}", display: true},
            {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
            {left: "\\begin{gather}", right: "\\end{gather}", display: true},
            {left: "\\begin{CD}", right: "\\end{CD}", display: true},
            {left: "\\[", right: "\\]", display: true}
        ],
        throwOnError: false
    }
    /*
    解析TextBlock body.type==TextBlock，聊天正文内容
    */
    porserTextBlock(body, father) {
        if (!body.size) {
            let div = this.getByClass('textBlock', 'div', father, 'markdown-body');

            //如果新的内容长度小于旧的内容，则内容被撤回了。将就的内容冻结。并将新的内容输出。
            if(div.dataset.the_markdown_text && div.dataset.the_markdown_text.length>body.text.length){
                div.classList.remove('textBlock');
                div.classList.add('textBlockDeleted');
                let endDiv = document.createElement('div');
                endDiv.classList.add('textBlockDeletedEnd');
                endDiv.innerHTML = '[以上被撤回的信息可能包不适宜的内容，已被隐藏。] <input type="checkbox">显示'
                insertAfter(endDiv,div);
                let newDiv = this.getByClass('textBlock', 'div', father, 'markdown-body');
                insertAfter(newDiv,endDiv);
                div = newDiv;
            }

            div.dataset.the_markdown_text = body.text;
            div.innerHTML = marked.marked(this.completeCodeBlock(body.text));//解析markdown
            renderMathInElement(div,this.renderMathInElementOptions);//解析数学公式
            for (let codeBox of div.getElementsByTagName('code')) {
                hljs.highlightElement(codeBox);//代码高亮
            }

            for (let pre of div.getElementsByTagName('pre')){//添加复制按钮
                //添加复制按钮
                let div = document.createElement('div');
                div.classList.add('code-copy');
                pre.appendChild(div);
            }

            let aaas = div.getElementsByTagName('a');
            //将超链接在新页面打开
            for(let i=0;i<aaas.length;i++){
                aaas[i].target = '_blank';
            }
            //如果是注释则加上上标样式
            for(let i=0;i<aaas.length;i++){
                let reg = new RegExp('^\\^(\\d+)\\^$');
                if(reg.test(aaas[i].innerHTML)){
                    aaas[i].innerHTML = aaas[i].innerHTML.replace(reg,'$1');
                    aaas[i].classList.add('superscript');
                }
            }


            let nxdiv = this.getByClass('throttling', 'div', father);
            nxdiv.innerHTML = `
<div class="copy-bingcat click">复制</div>
<div class="copy-bingcat-markdown click">复制Markdowm</div>
<div>${this.throttling.numUserMessagesInConversation} / ${this.throttling.maxNumUserMessagesInConversation}</div>`;
        } else if (body.size === 'small') {
            //原本bing官网的small并没有输出
        }
    }

    /*
    添加单行简单文本
    */
    porserLineTextBlocks(inline, father) {
        father.innerHTML = `<p>${inline}</p>`;
    }

    /***
     解析sourceAttributions 聊天消息引用链接部分
     */
    porserSourceAttributions(sourceAttributions, father) {
        let html = '';
        for (let i = 0; i < sourceAttributions.length; i++) {
            let sourceAttribution = sourceAttributions[i];
            html = html + `<a target="_blank" href="${sourceAttribution.seeMoreUrl}">${sourceAttribution.providerDisplayName}</a>`;
        }
        father.innerHTML = html;
    }
    /***
     解析suggestedResponses 建议发送的消息，聊天建议
     */
    porserSuggestedResponses(suggestedResponses) {
        let sss = [];
        for (let i = 0; i < suggestedResponses.length; i++) {
            sss[sss.length] = suggestedResponses[i].text;
        }
        if(this.chatSuggestionsWorker){
            this.chatSuggestionsWorker.set(sss);
        }else {
            console.debug('chatSuggestionsWorker为null');
        }

    }

    /**
     * 获取处理消息的函数
     * @param fun {function(OnMessageFunEvent)} 当发生事件时的回调函数
     * @return {function(Object,ReturnMessage)}
     * */
    getOnMessageFun(fun) {
        return (json, returnMessage) => {
            if (json.type === "close") {
                console.log(json.mess)
                if (!json.ok) {
                    this.addError("聊天异常中断了！可能是网络问题。");
                    fun(new OnMessageFunEvent('close-accident', '意外关闭'));
                }else {
                    fun(new OnMessageFunEvent('close', '回复结束'));
                }
                return;
            }
            if (json.type === 'error') {
                this.addError("连接发生错误：" + json.mess);
                fun(new OnMessageFunEvent('error', '回复结束'));
                return;
            }
            if (json.type === 3) {
                if(json.error){
                    this.addError(json.error)
                    this.addError("发生未知错误")
                }
                returnMessage.close();
            } else if (json.type === 1) {
                this.porserArguments(json.arguments,returnMessage);
            } else if (json.type === 2) {
                this.porserType2Item(json.item,returnMessage);
            } else {
                console.log(JSON.stringify(json));
            }
        };
    }
}

class OnMessageFunEvent{
    type;
    message;
    constructor(type, message) {
        this.type = type;
        this.message = message;
    }
}

/**
 * 在指定元素后面插入新元素
 * @param {Element} newElement
 * @param {Element} targetElement
 * */
function insertAfter(newElement,targetElement){
    let parent = targetElement.parentNode;
    if(parent.lastChild === targetElement){
        parent.appendChild(newElement);
    }else{
        parent.insertBefore(newElement,targetElement.nextSibling);
    }
}