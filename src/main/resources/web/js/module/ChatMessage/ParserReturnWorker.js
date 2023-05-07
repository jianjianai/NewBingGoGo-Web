import generateImages from "../aToos/generateImages.js";
import nBGGFetch from "../aToos/nBGGFetch.js";
import SwitchWorker from "../SwitchWorker.js";

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
    //(string)
    addMyChat(message) {
        let bobo = document.createElement('div');
        bobo.style.whiteSpace = 'pre-wrap';
        bobo.innerText = message;
        bobo.classList.add('bobo');
        bobo.classList.add('markdown-body');
        let go = document.createElement('div');
        go.classList.add('my');
        go.appendChild(bobo);
        this.chatDiv.appendChild(go);
    }

    //(string)
    addError(message) {
        let go = document.createElement('div');
        go.classList.add('error');
        go.innerHTML = message;
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

//解析type2的item
    porserType2Item(item){
        let chatDiv = document.getElementById('chat');
        if(item.result){
            let result = item.result;
            if(result.value==='Success'){

            }else if (result.value === 'Throttled') {
                this.addError(result.message);
                this.addError('24消息请求数达到了限制！');
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
        }

    }
    /**
     * 解析arguments
     * 解析聊天消息，将消息添加到页面
     * **/
    porserArguments(argumentss) {
        for (let i = 0; i < argumentss.length; i++) {
            this.porserType2Item(argumentss[i]);
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
            if (!message.messageType && message.adaptiveCards) {//如果是正常的聊天
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
        if(father[message.messageId+'renderCardRequest']){//防止解析多次
            return;
        }
        father[message.messageId+'renderCardRequest'] = true;

        let url = 'https://www.bing.com/search?'
        let theUrls = new URLSearchParams();
        theUrls.append("showselans",1);
        theUrls.append("q",message.text);
        theUrls.append("iframeid",message.messageId);
        let src = url+theUrls.toString();

        nBGGFetch(src).then(async (ret)=>{
            let html = await ret.text();
            // b_poleContent pc设备  || b_ans b_imgans 移动设备
            if(html.indexOf('class="b_poleContent"')>=0 || html.indexOf('class="b_ans')>=0){
                let div = this.getByID(message.messageId, 'div', father, 'RenderCardRequest');
                div.innerHTML = `<iframe role="presentation" src="${src}"></iframe>`;
            }
        });
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
    解析TextBlock body.type==TextBlock
    */
    porserTextBlock(body, father) {
        if (!body.size) {
            let div = this.getByClass('textBlock', 'div', father, 'markdown-body');

            //如果新的内容长度小于旧的内容，则内容被撤回了。将就的内容冻结。并将新的内容输出。
            if(div.dataset.text && div.dataset.text.length>body.text.length){
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

            div.dataset.text = body.text;
            div.innerHTML = marked.marked(this.completeCodeBlock(body.text));
            renderMathInElement(div,this.renderMathInElementOptions);
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
            nxdiv.innerHTML = `${this.throttling.numUserMessagesInConversation} / ${this.throttling.maxNumUserMessagesInConversation}`;
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