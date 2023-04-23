/**
(id,元素的tag,父元素,创建时顺便添加的class:可以多个)
获取一个指定id的元素如果没用就在服元素创建这个元素
*/
function getByID(id, tag, father) {
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
function getByClass(className, tag, father) {
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

function test(test) {
    porserArguments(test.arguments);
}

var throttling = {
    "maxNumUserMessagesInConversation": 0,
    "numUserMessagesInConversation": 0
};

//解析type2的item
function porserType2Item(item){
    let chatDiv = document.getElementById('chat');
    if(item.result){
        let result = item.result;
        if(result.value=='Success'){
            
        }else if (result.value == 'Throttled') {
            addError(result.message);
            addError('24消息请求数达到了限制！');
        }else{
            addError(result.message);
            addError('发生未知错误！');
        }
    }
    if (item.throttling) {
        throttling = item.throttling;
    }
    if (item.messages) {
        let nextFather = getByID(item.requestId, 'div', chatDiv, 'bing');
        porserMessages(item.messages, nextFather);
    }
    
}
/**
 * 解析arguments
 * 解析聊天消息，将消息添加到页面
 * **/
function porserArguments(argumentss) {
    for (let i = 0; i < argumentss.length; i++) {
        porserType2Item(argumentss[i]);
    }
}

/* 
解析messages
*/
function porserMessages(messages, father) {
    for (let i = 0; i < messages.length; i++) {
        let message = messages[i];
        if(message.author=='user'){
            continue;//不解析用户的消息
        }

        //解析adaptiveCards 也就是聊天消息部分 下面类型的都是带有adaptiveCards的
        if (!message.messageType && message.adaptiveCards) {//如果是正常的聊天
            let adaptiveCardsFatherDIV = getByID(message.messageId, 'div', father, 'adaptiveCardsFatherDIV');
            porserAdaptiveCards(message.adaptiveCards, adaptiveCardsFatherDIV);

            //解析sourceAttributions 也就是引用链接部分
            if (message.sourceAttributions) {
                if (message.sourceAttributions.length > 0) {
                    let sourceAttributionsDIV = getByID(message.messageId + 'sourceAttributions', 'div', father, 'sourceAttributions');
                    porserSourceAttributions(message.sourceAttributions, sourceAttributionsDIV);
                }
            }
            //解析suggestedResponses 建议发送的消息，聊天建议
            if (message.suggestedResponses) {
                porserSuggestedResponses(message.suggestedResponses);
            }

        } else if (message.messageType == 'InternalSearchQuery') { //如果是收索消息
            let div = getByID(message.messageId, 'div', father, 'InternalSearchQuery');
            porserLineTextBlocks(message.text, div);

        } else if (message.messageType == 'InternalLoaderMessage') { //如果是加载消息
            let div = getByID(message.messageId, 'div', father, 'InternalLoaderMessage');
            porserLineTextBlocks(message.text, div);

        } else if (message.messageType == 'GenerateContentQuery') {//如果是生成内容查询
            let div = getByID(message.messageId, 'div', father, 'GenerateContentQuery');
            generateContentQuery(message, div);

        }else if (message.messageType == 'RenderCardRequest'){//渲染卡片请求，目前不知道有什么用
            renderCardRequest(message, father);

        }else if(message.messageType == 'Disengaged'){
            let div = getByID(message.messageId, 'div', chat, 'error');
            div.innerHTML = `
            ${message.hiddenText}<br>聊天中断！试试开始新主题？
            `;

        }else if(message.contentOrigin == 'TurnLimiter'){
            addError(message.text);
            addError('聊天被限制了，试试开始新主题？');

        } else {
            console.log('发现一个另类message', JSON.stringify(message));
        }

    }
}

/*
解析渲染卡片请求，暂时不知道如何解析这个请求,就先判断里面有没有内容吧！没有就不显示。
*/
function renderCardRequest(message,father){
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
    
    fetch(src).then(async (ret)=>{
        let html = await ret.text();
        // b_poleContent pc设备  || b_ans b_imgans 移动设备
        if(html.indexOf('class="b_poleContent"')>=0 || html.indexOf('class="b_ans')>=0){
            let div = getByID(message.messageId, 'div', father, 'RenderCardRequest');
            div.innerHTML = `<iframe role="presentation" src="${src}"></iframe>`;
        }
    });
}


/*
解析generateContentQuery生成内容查询,目前是只有图片
*/
function generateContentQuery(message, father) {
    if(message.contentType=="IMAGE"){
        if(father.runed){//防止生成多次
            return;
        }
        father.runed = true;
        generateContentQueryImg(message, father);
    }else{
        console.log('发现一个另类generateContentQuery', JSON.stringify(message));
    }
}

/**
 * 解析图片生成目前是只有图片
 */
function generateContentQueryImg(message, father){
    getMagicUrl().then(async magicUrl => {
        if (!magicUrl) {
            addError("魔法链接不正确！无法加载图片");
            return;
        }
        if (!expUrl.test(magicUrl)) {
            addError("魔法链接不正确！无法加载图片")
            return;
        }
        let theUrls = new URLSearchParams();
        theUrls.append('re', '1');
        theUrls.append('showselective', '1');
        theUrls.append('sude', '1');
        theUrls.append('kseed', '7500');
        theUrls.append('SFX', '2');
        theUrls.append('q', message.text);
        theUrls.append('iframeid', message.requestId);
        let theUrl = URLTrue(magicUrl,"images/create?") + theUrls.toString();
        
        try{
            father.innerHTML = `正在生成${message.text}的图片.`;
            let html = (await (await fetch(theUrl)).text());

            //如果有错误就输出错误
            let urr = new RegExp('class="gil_err_mt">([^<>]*)</div>').exec(html);
            if(urr && urr[1]){
                father.innerHTML = `<h3>${urr[1]}</h3>`
                urr = new RegExp('class="gil_err_sbt">(([^<>]*<(a|div)[^<>]*>[^<>]*</(a|div)>[^<>]*)*)</div>').exec(html);
                if(urr && urr[1]){
                    father.innerHTML = father.innerHTML+`<p>${urr[1]}</p>`;
                }
                return;
            }

            //如果没错误就匹配链接获取图片
            urr = new RegExp('"/(images/create/async/results/(\\S*))"').exec(html);
            if(!urr || !urr[1]){
                console.log(html);
                addError("请求图片返回不正确的页面，无法加载图片。");
                return;
            }
            let ur = urr[1];
            ur = ur.replaceAll('&amp;','&');
            let imgPageHtmlUrl = URLTrue(magicUrl,ur);
            let count = 0;
            let run = async ()=>{
                father.innerHTML = `正在生成${message.text}的图片.${count}`;
                if(count>20){
                    father.innerHTML = "请求图片超时！";
                    return;
                }
                count++;
                let imgPageHtml;
                try{
                    imgPageHtml = (await (await fetch(imgPageHtmlUrl)).text());
                }catch(e){
                    console.error(e);
                }
                if(!imgPageHtml){
                    setTimeout(run,3000);
                    return;
                }

                father.innerHTML = '';
                let theUrls = new URLSearchParams();
                theUrls.append('createmessage',message.text);
                let a = document.createElement("a");
                father.appendChild(a);
                //用正则找全部图片
                let allSrc = imgPageHtml.matchAll(/<img[^<>]*src="([^"]*)"[^<>]*>/g);
                let src = undefined;
                let ok = false;
                while(!(src=allSrc.next()).done){
                    ok =true;
                    theUrls.append('imgs',src.value[1].split('?')[0]);
                    let img = document.createElement("img");
                    img.src = src.value[1];
                    a.appendChild(img);
                }
                if(ok){
                    a.target = '_blank';
                    a.href = '../GeneratePicture/img.html?'+theUrls.toString();
                }else{
                    father.innerHTML = "服务器未正常返回图片！";
                }
            }
            setTimeout(run,3000);
            
        }catch(e){
            console.error(e);
            addError("请求图片失败:"+e);
        }
    });
}

/*
解析adaptiveCards 聊天消息部分
*/
function porserAdaptiveCards(adaptiveCards, father) {
    for (let i = 0; i < adaptiveCards.length; i++) {
        let adaptiveCard = adaptiveCards[i];
        if (adaptiveCard.type == 'AdaptiveCard') {
            porserbody(adaptiveCard.body, father);
        } else {
            console.log('发现一个不是AdaptiveCard的adaptiveCard', JSON.stringify(adaptiveCard));
        }
    }

}
/**
解析body adaptiveCards[].body这个部分
 */
function porserbody(bodys, father) {
    for (let i = 0; i < bodys.length; i++) {
        let body = bodys[i];
        if (body.type == 'TextBlock') {
            porserTextBlock(body, father);
        }else {
            console.log('发现一个不是TextBlock的body', JSON.stringify(body));
        }
    }
}



/**
补全代码块，如果文本中有~~~开头却没有~~~结束则在最后补一个~~~，防止内容生成时闪烁
*/
function completeCodeBlock(makerdown){
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
    let out = to(
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
   // console.log(out);
    return out;
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
function porserTextBlock(body, father) {
    if (!body.size) {
        let div = getByClass('textBlock', 'div', father, 'markdown-body');
        div.innerHTML = marked.marked(completeCodeBlock(body.text));
        renderMathInElement(div,renderMathInElementOptions);
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


        let nxdiv = getByClass('throttling', 'div', father);
        nxdiv.innerHTML = `${throttling.numUserMessagesInConversation} / ${throttling.maxNumUserMessagesInConversation}`;
    } else if (body.size == 'small') {
        //原本bing官网的small并没有输出
    }
}
/*
添加单行简单文本
*/
function porserLineTextBlocks(inline, father) {
    father.innerHTML = `<p>${inline}</p>`;
}

/***
解析sourceAttributions 聊天消息引用链接部分
 */
function porserSourceAttributions(sourceAttributions, father) {
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
function porserSuggestedResponses(suggestedResponses) {
    var searchSuggestions = document.getElementById('SearchSuggestions');
    searchSuggestions.innerHTML = '';
    for (let i = 0; i < suggestedResponses.length; i++) {
        let a = document.createElement('a');
        a.innerHTML = suggestedResponses[i].text;
        searchSuggestions.appendChild(a);
    }
    searchSuggestionsAddOnclick();
}