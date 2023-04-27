//定义对象
/**
 * 用于发送聊天消息和接受消息的对象
 * 使用静态方法 createBingChat 创建
 */
class BingChat {
	/**
	 * 处理发送消息的类
	 * */
	static SendMessageManager = class{
		invocationId;
		conversationId;
		clientId;
		conversationSignature;
		optionsSets;
		//(会话id，客户端id，签名id，是否是开始)
		//(string,string,string,boolena)
		constructor(conversationId, clientId, conversationSignature,invocationId) {
			this.invocationId = invocationId===undefined?1:invocationId;
			this.conversationId = conversationId;
			this.clientId = clientId;
			this.conversationSignature = conversationSignature;
			this.optionsSets = 'balance';
		}

		//chatTypes中的一种
		setChatType(chatType) {
			this.optionsSets = chatType;
		}

		//发送json数据
		async sendJson(chatWebSocket, json) {
			let go = JSON.stringify(json) + '\u001e';
			await chatWebSocket.send(go);
			console.log('发送', go)
		}
		//获取用于发送的握手数据
		//(WebSocket)
		async sendShakeHandsJson(chatWebSocket) {
			await this.sendJson(chatWebSocket, {
				"protocol": "json",
				"version": 1
			});
		}
		//获取用于发送的聊天数据
		//(WebSocket,sreing)
		async sendChatMessage(chatWebSocket, chat) {
			let optionsSets = BingChat.ChatOptionsSets.chatTypes[this.optionsSets];
			if(!optionsSets){
				optionsSets = BingChat.ChatOptionsSets.chatTypes.balance;
				console.warn("不存在的ChatType",this.optionsSets);
			}

			let json = {
				"arguments": [{
					"source": BingChat.ChatOptionsSets.source,
					"optionsSets": optionsSets,
					"allowedMessageTypes": BingChat.ChatOptionsSets.allowedMessageTypes,
					"sliceIds": BingChat.ChatOptionsSets.sliceIds,
					"verbosity": "verbose",
					"traceId": this.getUuidNojian(),
					"isStartOfSession": (this.invocationId <= 1),
					"message": await BingChat.ChatOptionsSets.generateMessages(this,chat),
					"conversationSignature": this.conversationSignature,
					"participant": {
						"id": this.clientId
					},
					"conversationId": this.conversationId,
					"previousMessages": (this.invocationId <= 1) ? await BingChat.ChatOptionsSets.getPreviousMessages() : undefined
				}],
				"invocationId": this.invocationId.toString(),
				"target": "chat",
				"type": 4
			};
			await this.sendJson(chatWebSocket, json);
			this.invocationId++;
		}
		getUuidNojian() {
			return URL.createObjectURL(new Blob()).split('/')[3].replace(/-/g, '');
		}
	};
	/**
	 * 处理返回消息的类
	 * */
	static ReturnMessage = class  {
		//(WebSocket,function:可以不传)
		constructor(catWebSocket, lisin) {
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
			catWebSocket.onclose = () => {
				for (let i in this.onMessage) {
					if ((typeof this.onMessage[i]) == 'function') {
						try {
							this.onMessage[i]({
								type: 'close',
								mess: '连接关闭'
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
		/*
        获取消息WebSocket
        */
		getCatWebSocket() {
			return this.catWebSocket;
		}
		/**
		 * 注册收到消息监听器
		 */
		//(function(json,ReturnMessage))
		regOnMessage(theFun) {
			this.onMessage[this.onMessage.length] = theFun;
		}
	};
	/**
	 * 获取bing第一条消息的类对象
	 * */
	static ChatFirstMessages = new class {
		bingProposes = [
			'教我一个新单词',
			'我需要有关家庭作业的帮助',
			'我想学习一项新技能',
			'最深的海洋是哪个?',
			'一年有多少小时?',
			"宇宙是如何开始的?",
			"寻找非虚构作品",
			'火烈鸟为何为粉色?',
			'有什么新闻?',
			'让我大笑',
			'给我看鼓舞人心的名言',
			'世界上最小的哺乳动物是什么?',
			'向我显示食谱',
			'最深的海洋是哪个?',
			'为什么人类需要睡眠?',
			'教我有关登月的信息',
			'我想学习一项新技能',
			'如何创建预算?',
			'给我说个笑话',
			'全息影像的工作原理是什么?',
			'如何设定可实现的目标?',
			'金字塔是如何建成的?',
			'激励我!',
			'宇宙是如何开始的?',
			'如何制作蛋糕?'
		];

		bingmMessages = [
			'好的，我已清理好板子，可以重新开始了。我可以帮助你探索什么?',
			'明白了，我已经抹去了过去，专注于现在。我们现在应该探索什么?',
			'重新开始总是很棒。问我任何问题!',
			'好了，我已经为新的对话重置了我的大脑。你现在想聊些什么?',
			'很好，让我们来更改主题。你在想什么?',
			'谢谢你帮我理清头绪! 我现在能帮你做什么?',
			'没问题，很高兴你喜欢上一次对话。让我们转到一个新主题。你想要了解有关哪些内容的详细信息?',
			'谢谢你! 知道你什么时候准备好继续前进总是很有帮助的。我现在能为你回答什么问题?',
			'当然，我已准备好进行新的挑战。我现在可以为你做什么?'
		]

		StartMessage = this.bingmMessages[0];
		Proposes = [this.bingProposes[0],this.bingProposes[1],this.bingProposes[2]];
		/**
		 获取建议消息
		 */
		async nextStartProposes(){
			this.Proposes[0] = this.bingProposes[Math.floor(Math.random() * this.bingProposes.length)];
			this.Proposes[1] = this.bingProposes[Math.floor(Math.random() * this.bingProposes.length)];
			this.Proposes[2] = this.bingProposes[Math.floor(Math.random() * this.bingProposes.length)];
			return this.Proposes;
		}
		/*
        获取bing的第一条消息
        */
		nextStartMessage(){
			return this.StartMessage = this.bingmMessages[Math.floor(Math.random() * this.bingmMessages.length)];
		}

		getStartMessage(){
			return this.StartMessage;
		}

		getStartProposes(){
			return this.Proposes;
		}
	};
	/**
	 * 处理聊天选项的类对象
	 * */
	static ChatOptionsSets = new class {
		//聊天选项
		chatTypes = {
			//更有创造力选项
			create: [
				"nlu_direct_response_filter",
				"deepleo",
				"disable_emoji_spoken_text",
				"responsible_ai_policy_235",
				"enablemm",
				"h3imaginative",
				"responseos",
				"cachewriteext",
				"e2ecachewrite",
				"nodlcpcwrite",
				"travelansgnd",
				"dv3sugg",
				"clgalileo",
				"gencontentv3"
			],
			//balance 平衡模式选项
			balance: [
				"nlu_direct_response_filter",
				"deepleo",
				"disable_emoji_spoken_text",
				"responsible_ai_policy_235",
				"enablemm",
				"galileo",
				"responseos",
				"cachewriteext",
				"e2ecachewrite",
				"nodlcpcwrite",
				"travelansgnd",
				"dv3sugg"
			],
			//精准选项
			accurate: [
				"chk1cf",
				"nopreloadsscf",
				"winlongmsg2tf",
				"perfimpcomb",
				"sugdivdis",
				"sydnoinputt",
				"wpcssopt",
				"wintone2tf",
				"0404sydicnbs0",
				"405suggbs0",
				"scctl",
				"330uaugs0",
				"0329resp",
				"udscahrfon",
				"udstrblm5",
				"404e2ewrt",
				"408nodedups0",
				"403tvlansgnd"
			]
		}

//消息来源
		source = "cib";

//接收消息类型
		allowedMessageTypes = [
			"Chat",
			"InternalSearchQuery",
			"InternalSearchResult",
			"Disengaged",
			"InternalLoaderMessage",
			"RenderCardRequest",
			"AdsQuery",
			"SemanticSerp",
			"GenerateContentQuery",
			"SearchQuery"
		]

//切片id，也不知道是啥意思，反正官网的更新了
		sliceIds = [
			"chk1cf",
			"nopreloadsscf",
			"winlongmsg2tf",
			"perfimpcomb",
			"sugdivdis",
			"sydnoinputt",
			"wpcssopt",
			"wintone2tf",
			"0404sydicnbs0",
			"405suggbs0",
			"scctl",
			"330uaugs0",
			"0329resp",
			"udscahrfon",
			"udstrblm5",
			"404e2ewrt",
			"408nodedups0",
			"403tvlansgnd"
		]




//生成消息对象
		async generateMessages(sendMessageManager/*消息管理器*/,chatMessageText/*要发送的消息文本*/){
			function timeString() {
				let d = new Date();
				let year = d.getFullYear();
				let month = (d.getMonth() + 1).toString().padStart(2, "0");
				let date = d.getDate().toString().padStart(2, "0");
				let hour = d.getHours().toString().padStart(2, "0");
				let minute = d.getMinutes().toString().padStart(2, "0");
				let second = d.getSeconds().toString().padStart(2, "0");
				let offset = "+08:00"; // 你可以根据需要修改这个值
				return year + "-" + month + "-" + date + "T" + hour + ":" + minute + ":" + second + offset;
			}

			if(!sendMessageManager.startTime){
				sendMessageManager.startTime = timeString();
			}
			return {
				"locale": "zh-CN",
				"market": "zh-CN",
				"region": "US",
				"location": "lat:47.639557;long:-122.128159;re=1000m;",
				"locationHints": [
					{
						"Center": {
							"Latitude": 30.474109798833613,
							"Longitude": 114.39626256171093
						},
						"RegionType": 2,
						"SourceType": 11
					},
					{
						"country": "United States",
						"state": "California",
						"city": "Los Angeles",
						"zipcode": "90060",
						"timezoneoffset": -8,
						"dma": 803,
						"countryConfidence": 8,
						"cityConfidence": 5,
						"Center": {
							"Latitude": 33.9757,
							"Longitude": -118.2564
						},
						"RegionType": 2,
						"SourceType": 1
					}
				],
				"timestamp": sendMessageManager.startTime,
				"author": "user",
				"inputMethod": "Keyboard",
				"text": chatMessageText,
				"messageType": "Chat"
			}

		}

		async getPreviousMessages(){
			function getUuid() {
				return URL.createObjectURL(new Blob()).split('/')[3];
			}
			let pos = BingChat.ChatFirstMessages.getStartProposes();
			return [{
				"text": BingChat.ChatFirstMessages.getStartMessage(),
				"author": "bot",
				"adaptiveCards": [],
				"suggestedResponses": [{
					"text": pos[0],
					"contentOrigin": "DeepLeo",
					"messageType": "Suggestion",
					"messageId": getUuid(),
					"offense": "Unknown"
				}, {
					"text": pos[1],
					"contentOrigin": "DeepLeo",
					"messageType": "Suggestion",
					"messageId": getUuid(),
					"offense": "Unknown"
				}, {
					"text": pos[2],
					"contentOrigin": "DeepLeo",
					"messageType": "Suggestion",
					"messageId": getUuid(),
					"offense": "Unknown"
				}],
				"messageId": getUuid(),
				"messageType": "Chat"
			}];
		}
	};

	sendMessageManager;

	//theChatType chatTypes变量中的其中一个
	//invocationId 可以不传
	//(string,ture|false|'repeat',string,string,string,theChatType,int|undefined)
	constructor(charID, clientId, conversationSignature, theChatType,invocationId) {
		this.sendMessageManager = new BingChat.SendMessageManager(charID, clientId, conversationSignature,invocationId);
		if (theChatType) {
			this.sendMessageManager.setChatType(theChatType);
		}
	}
	/**
	 * 返回 ReturnMessage 抛出异常信息错误
	 * 参数 消息string,当收到消息的函数,当关闭时函数
	 *
	 */
	//(string,function:可以不传)
	async sendMessage(message, onMessage) {
		try {
			let restsrstUrl = `${window.location.origin.replace('http','ws')}/sydney/ChatHub`;
			let chatWebSocket = new WebSocket(restsrstUrl);
			chatWebSocket.onopen = () => {
				this.sendMessageManager.sendShakeHandsJson(chatWebSocket);
				this.sendMessageManager.sendChatMessage(chatWebSocket, message);
			}
			return new BingChat.ReturnMessage(chatWebSocket, onMessage);
		} catch (e) {
			console.warn(e);
			throw new Error("无法连接到web服务器，请刷新页面重试:" + e.message);
		}
	}

	/**
	 创建一个新对话
	 */
	static async createBingChat(theChatType) {
		//开始运行
		let res
		try {
			res = await fetch(`${window.location.origin}/turing/conversation/create`,{headers:{"NewBingGoGoWeb":"true"}});
		} catch (e) {
			console.warn(e);
			throw new Error("无法连接到web服务器，请刷新页面重试:" + e.message);
		}
		let cookieID = res.headers.get("cookieID");
		let rText = await res.text();
		if(rText.length<1){
			throw new Error(`服务所在地区无法使用或cookie失效，第${cookieID}个账号。`);
		}
		let resjson = JSON.parse(rText);
		if (!resjson.result) {
			console.warn(resjson);
			throw new Error("未知错误！");
		}
		if (resjson.result.value !== 'Success') {
			console.warn(resjson);
			let type = resjson.result.value;
			let mess = resjson.result.message;
			if (resjson.result.value === 'UnauthorizedRequest') {
				type = 'NoLogin'
				mess = `cookie失效，第${cookieID}个cookie。`;
			} else if (resjson.result.value === 'Forbidden') {
				type = 'NoPower'
				mess = `cookie无权限，第${cookieID}个cookie。`;
			}
			let error = new Error(mess);
			error.type = type;
			throw error;
		}
		return new BingChat(resjson.conversationId, resjson.clientId, resjson.conversationSignature, theChatType);
	}
}

/**
 * 解析消息的对象
 * */
class ParserReturnMessage{
	chatDiv;//放置消息的div
	/**
	 * @param chatDiv 放置聊天消息的div
	 * */
	constructor(chatDiv) {
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
	 * @param type 聊天类型，
	 * */
	restart(type){
		this.chatDiv.innerHTML = `
		<div class="bing">
			<div class="adaptiveCardsFatherDIV">
				<div class="textBlock markdown-body">
					${BingChat.ChatFirstMessages.nextStartMessage(type)}
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

		fetch(src).then(async (ret)=>{
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
		let theUrls = new URLSearchParams();
		theUrls.append('re', '1');
		theUrls.append('showselective', '1');
		theUrls.append('sude', '1');
		theUrls.append('kseed', '7500');
		theUrls.append('SFX', '2');
		theUrls.append('q', message.text);
		theUrls.append('iframeid', message.requestId);
		let theUrl = `${window.location.origin}/images/create?${theUrls.toString()}`;
		father.innerHTML = `正在生成${message.text}的图片.`;

		try{
			let response  = await fetch(theUrl,{headers:{"NewBingGoGoWeb":"true"}});
			let html = (await response.text());
			let cookieID = response.headers.get('cookieID');

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
				this.addError("请求图片返回不正确的页面，无法加载图片。");
				return;
			}
			let ur = urr[1];
			ur = ur.replaceAll('&amp;','&');
			let imgPageHtmlUrl = `${window.location.origin}/${ur}`;
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
					imgPageHtml = (await (await fetch(imgPageHtmlUrl,{headers:{"cookieID":cookieID,"NewBingGoGoWeb":"true"}})).text());
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
					a.href = './imgs.html?'+theUrls.toString();
				}else{
					father.innerHTML = "服务器未正常返回图片！";
				}
			}
			setTimeout(run,3000);

		}catch(e){
			console.error(e);
			this.addError("请求图片失败:"+e);
		}
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
		var searchSuggestions = document.getElementById('SearchSuggestions');
		searchSuggestions.innerHTML = '';
		for (let i = 0; i < suggestedResponses.length; i++) {
			let a = document.createElement('a');
			a.innerHTML = suggestedResponses[i].text;
			searchSuggestions.appendChild(a);
		}
	}
}

/**
 * 聊天模式的切换的管理类
 * */
class ChatModeSwitchingManager{
	static ChatType = {
		create:'create',
		balance:'balance',
		accurate:'accurate'
	};
	backgroundDIV;
	chatTypeChoseCreate;
	chatTypeChoseBalance;
	chatTypeChoseAccurate;
	chatTypeDiv;
	//默认平衡
	thisChatType = ChatModeSwitchingManager.ChatType.balance;
	constructor(backgroundDIV,chatTypeChoseCreate,chatTypeChoseBalance,chatTypeChoseAccurate,chatTypeDiv) {
		this.backgroundDIV = backgroundDIV;
		this.chatTypeChoseCreate = chatTypeChoseCreate;
		this.chatTypeChoseBalance = chatTypeChoseBalance;
		this.chatTypeChoseAccurate = chatTypeChoseAccurate;
		this.chatTypeDiv = chatTypeDiv;

		//创造力模式
		chatTypeChoseCreate.onclick = () => {
			if (chatTypeDiv.style.opacity === '0') {
				return;
			}
			this.setChatModType(ChatModeSwitchingManager.ChatType.create);
			//reSetStartChatMessage(ChatModeSwitchingManager.ChatType.create);
		}
		//平衡模式
		chatTypeChoseBalance.onclick = () => {
			if (chatTypeDiv.style.opacity === '0') {
				return;
			}
			this.setChatModType(ChatModeSwitchingManager.ChatType.balance);
			// reSetStartChatMessage(ChatModeSwitchingManager.ChatType.balance);
		}
		//准确模式
		chatTypeChoseAccurate.onclick = () => {
			if (chatTypeDiv.style.opacity === '0') {
				return;
			}
			this.setChatModType(ChatModeSwitchingManager.ChatType.accurate);
			// reSetStartChatMessage(ChatModeSwitchingManager.ChatType.accurate);
		}
	}

	//设置聊天模式
	/**
	 * @param chatType 聊天选项，ChatModeSwitchingManager.ChatType中的一种
	 * */
	setChatModType(chatType){
		if(this.thisChatType === chatType){
			return;
		}
		if (chatType === ChatModeSwitchingManager.ChatType.create) {//有创造力的
			this.thisChatType = ChatModeSwitchingManager.ChatType.create;
			this.chatTypeChoseCreate.classList.add('Chose');
			this.chatTypeChoseBalance.classList.remove('Chose');
			this.chatTypeChoseAccurate.classList.remove('Chose');
			this.backgroundDIV.className = 'a';
		} else if (chatType === ChatModeSwitchingManager.ChatType.balance) {//平衡
			this.thisChatType = ChatModeSwitchingManager.ChatType.balance;
			this.chatTypeChoseCreate.classList.remove('Chose');
			this.chatTypeChoseBalance.classList.add('Chose');
			this.chatTypeChoseAccurate.classList.remove('Chose');
			this.backgroundDIV.className = 'b';
		} else if (chatType === ChatModeSwitchingManager.ChatType.accurate) {//精确的
			this.thisChatType = ChatModeSwitchingManager.ChatType.accurate;
			this.chatTypeChoseCreate.classList.remove('Chose');
			this.chatTypeChoseBalance.classList.remove('Chose');
			this.chatTypeChoseAccurate.classList.add('Chose');
			this.backgroundDIV.className = 'c';
		} else {
			console.warn("错误的聊天类型", chatType);
			return;
		}
		this.onChatTypeChange(chatType);
	}

	/**
	 * 需要重写
	 * 当聊天类型改变时调用
	 * @param chatType 新的聊天类型
	 * */
	onChatTypeChange(chatType){
		console.log(`onChatTypeChange方法没有被重写！,聊天类型切换到'${chatType}'`);
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


/**
 * 聊天建议管理器
 * */
class ChatSuggestionsManager{
	searchSuggestions;//聊天建议dom
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
	restart() {
		this.searchSuggestions.innerHTML = '';
		BingChat.ChatFirstMessages.nextStartProposes().then((prs)=>{
			prs.forEach((s) => {
				let a = document.createElement('a');
				a.innerHTML = s;
				this.searchSuggestions.appendChild(a);
			});
		});
	}

	//清空聊天建议
	clear(){
		this.searchSuggestions.innerHTML = '';
	}

	/**
	 * 需要重写
	 * 当用户选择发生这条消息时触发
	 * @param text 用户选择的文本
	 * */
	onSend(text) {
		console.warn(`onSend方法没有被重写！,用户发送'${text}'`);
	}
}


/**
 * 提示词管理器
 * */
class CueWordManager{
	cueWordSelectsList;//提示词列表dom
	cueWordSelected;//已选择的提示词mod
	cueWordSearchInput;//提示词搜索输入框dom
	constructor(cueWordSelectsList,cueWordSelected,cueWordSearchInput) {
		this.cueWordSelectsList = cueWordSelectsList;
		this.cueWordSelected = cueWordSelected;
		this.cueWordSearchInput = cueWordSearchInput;
		//添加和删除提示词
//添加提示词
		cueWordSelectsList.onclick = (exent)=>{
			if(exent.target.parentElement === cueWordSelectsList){
				cueWordSelected.appendChild(exent.target);
				//exent.target.style.display = 'inline-block';
			}
		}
//取消选择提示词
		cueWordSelected.onclick = (exent)=>{
			if(exent.target.parentElement === cueWordSelected){
				cueWordSelectsList.appendChild(exent.target);
			}
		}
//搜索提示词
		cueWordSearchInput.oninput = ()=>{
			let lis = cueWordSelectsList.getElementsByTagName("li");
			let text = cueWordSearchInput.value;
			for(let i=0;i<lis.length;i++){
				let li = lis[i];
				let show = false;
				if(!text){
					show = true;
				}
				if(li.innerHTML.indexOf(text)>=0){
					show = true;
				}
				if(li.dataset.word){
					if(li.dataset.word.indexOf(text)>=0){
						show = true;
					}
				}
				if(li.dataset.tags){
					if(li.dataset.tags.indexOf(text)>=0){
						show = true;
					}
				}
				if(show){
					li.style.display = 'inline-block';
				}else{
					li.style.display = 'none';
				}
			}
		}
	}
	//清空已选择的提示词
	clearCutWordString(){
		let lis = this.cueWordSelected.getElementsByTagName("li");
		for(let i=lis.length-1;i>=0;i--){
			let li = lis[i];
			this.cueWordSelectsList.appendChild(li);
		}
	}

//获取提示词文本
	getCutWordString(){
		let lis = this.cueWordSelected.getElementsByTagName("li");
		let string = '';
		for(let i=0;i<lis.length;i++){
			let li = lis[i];
			string = string+";"+li.dataset.word;
		}
		return string;
	}

//加载提示词,从本地和网络
	async loadcueWorld(){
		try{
			let re = await fetch('./resource/CueWord.json');
			let cueWords = await re.json();
			for(let i=0;i<cueWords.length;i++){
				let cue = cueWords[i];
				let li = document.createElement('li');

				//加载tags
				let tags = cue.tags;
				let tagsString = '';
				for(let j=0;j<tags.length;j++){
					let tag = tags[j];
					tagsString = tagsString+tag+'|'
				}
				li.dataset.tags = tagsString;

				//加载word
				li.dataset.word = cue.word;
				//加载name
				li.innerText = cue.name;

				this.cueWordSelectsList.appendChild(li);
			}
		}catch(r){
			console.warn(r);
		}
	}
}


/**
 * 管理标题的对象
 * */
class TitleManager{
	goGoSubtitleDiv;
	constructor(goGoSubtitleDiv) {
		this.goGoSubtitleDiv = goGoSubtitleDiv;
	}
	/**
	 * 设置文档标题
	 * */
	setPageTitleText(text){
		document.title = text;
	}
	/**
	 * 设置副标题
	 * */
	setSubtitleText(text){
		this.goGoSubtitleDiv.innerText = text;
	}
	/**
	 * 重置标题到初始状态
	 * */
	restart(){
		this.setSubtitleText('想发什么呢？让我帮你！');
		document.title = 'NewBingGoGo:聊天啦啦啦啦';
	}
	/**
	 * 正在创建聊天时
	 * */
	onCreating(){
		this.setSubtitleText('正在建立连接. 稍等！');
	}
	/**
	 * 正在发送消息时
	 * */
	onSending(){
		this.setSubtitleText('正在发送消息.');
	}
	/**
	 * 正在回复时
	 * */
	onAnswering(){
		this.setSubtitleText('正在接收消息.');
	}

	/**
	 * 等待下一条消息时
	 */
	waitingNext(){
		this.setSubtitleText('可以啦！来发送下一条消息吧！');
	}
}


//页面加载完成之后执行
window.addEventListener('load',()=>{
	//加载需要用到的对象
	const parserReturnMessage = new ParserReturnMessage(
		document.getElementById('chat')
	);
	const chatModeSwitchingManager = new ChatModeSwitchingManager(
		document.getElementById('background'),
		document.getElementById('chatTypeChoseCreate'),
		document.getElementById('chatTypeChoseBalance'),
		document.getElementById('chatTypeChoseAccurate'),
		document.getElementById('chatTypeDiv')
	);
	const chatSuggestionsManager = new ChatSuggestionsManager(
		document.getElementById('SearchSuggestions')//聊天建议dom
	);
	const cueWordManager = new CueWordManager(
		document.getElementById("cueWord-selects-list"),//提示词列表dom
		document.getElementById("cueWord-selected"),//已选择的提示词mod
		document.getElementById("cueWord-search-input")//提示词搜索输入框dom
	);
	const titleManager = new TitleManager(
		document.getElementById('goGoSubtitle')
	);

	//获取需要用到的元素
	const restart_button = document.getElementById('restart');
	const input_text = document.getElementById('input');
	const send_button = document.getElementById('send');
	const expand  = document.getElementById("expand");

	//定义需要用到的变量
	let onMessageIsOKClose = false;//消息是否正常接收完毕
	let talk; //聊天对象 BingChat 对象
	let returnMessage; //聊天返回对象
	let isSpeaking = false; //是否正在接收消息


	//回车键发送 ctrl+回车换行
	input_text.addEventListener('keydown', (event) => {
		//如果是展开状态就使用默认换行逻辑
		if (expand.classList.contains('open')) {
			return;
		}
		if (event.key === 'Enter' && !event.altKey) {
			event.preventDefault();
			//调用发送消息的函数
			onSend();
		} else if (event.key === 'Enter' && event.altKey) {
			event.preventDefault();
			// 插入换行符s
			input_text.value += "\n";
		}
	});


	function onMessage(json, returnMessage) {
		if (json.type === "close") {
			isSpeakingFinish();
			if (!onMessageIsOKClose) {
				parserReturnMessage.addError("聊天异常中断了！可能是网络问题。");
			}
			return;
		}
		if (json.type === 'error') {
			parserReturnMessage.addError("连接发生错误：" + json.mess);
			return;
		}
		onMessageIsOKClose = false
		if (json.type === 3) {
			onMessageIsOKClose = true;
			returnMessage.getCatWebSocket().close(1000, 'ok');
		} else if (json.type === 1) {
			parserReturnMessage.porserArguments(json.arguments);
		} else if (json.type === 2) {
			parserReturnMessage.porserType2Item(json.item);
		} else {
			console.log(JSON.stringify(json));
		}
	}

	/**重置聊天框和聊天建议到初始状态 */
	function reSetStartChatMessage(type) {
		parserReturnMessage.restart(type);
		chatSuggestionsManager.restart();
		titleManager.restart();
	}
	chatModeSwitchingManager.onChatTypeChange = reSetStartChatMessage;


	/**正在创建聊天 */
	function isAskingToMagic() {
		isSpeaking = true;
		titleManager.onCreating();
		send_button.value = '施法中.';
		chatSuggestionsManager.clear()
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
		chatSuggestionsManager.clear();
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
		chatModeSwitchingManager.hide();
		parserReturnMessage.addMyChat(text);
		if (!talk) {
			isAskingToMagic();
			try {
				talk = await BingChat.createBingChat(chatModeSwitchingManager.thisChatType);
			}catch (error){
				console.warn(error);
				parserReturnMessage.addError(error.message);
				isSpeakingFinish();
				return;
			}
		}
		try {
			isSpeakingStart();
			returnMessage = await talk.sendMessage(text, onMessage);
			isSpeakingStart(text);
		}catch (error){
			console.warn(error);
			isSpeakingFinish();
			parserReturnMessage.addError(error.message);
		}
	}
	chatSuggestionsManager.onSend = send;

	function onSend(){
		if (isSpeaking) {
			return;
		}
		let text = input_text.value;
		input_text.value = '';
		//连接提示词
		text = text+cueWordManager.getCutWordString();
		//清空提示词
		cueWordManager.clearCutWordString();

		//显示逻辑
		input_update_input_text_sstyle_show_update({ target: input_text });
		if (!text) {
			alert('什么都没有输入呀！');
			return;
		}

		//发送
		send(text).then();

		//关闭大输入框
		expand.classList.remove('open');
	}
	send_button.onclick = onSend;


	//开始新主题
	restart_button.onclick = () => {
		onMessageIsOKClose = true;
		if (returnMessage) {
			returnMessage.getCatWebSocket().close(1000, 'ok');
			returnMessage = undefined;
		}
		talk = undefined;
		isSpeakingFinish();
		reSetStartChatMessage();
		chatModeSwitchingManager.show();

	};


	//发送按钮出现逻辑
	function input_update_input_text_sstyle_show_update(v) {
		if (v.target.value) {
			send_button.style.opacity = '1';
		} else {
			send_button.style.opacity = '0';
		}
	}
	input_text.addEventListener("input", input_update_input_text_sstyle_show_update);



	//展开和缩小输入框
	expand.onclick = ()=>{
		if (!expand.classList.contains('open')) {
			expand.classList.add('open');
			return;
		}
		expand.classList.remove('open');
	}




	reSetStartChatMessage();
	input_update_input_text_sstyle_show_update({ target: input_text });
	cueWordManager.loadcueWorld().then();
});


// 当聊天更新时，如果窗口在底部则将窗口滚动到底部
window.addEventListener('load',()=>{
	let isOnBottom = (window.scrollY + window.innerHeight >= document.body.scrollHeight);//标记页面是否在底部
	let catDiv = document.getElementById('chat');

	//监听页面变化
	let observer = new MutationObserver(()=>{
		//如果窗口变化前在底部则滚动到底部
		if(isOnBottom){
			window.scrollTo(0, document.body.scrollHeight);
		}
	});
	observer.observe(catDiv, {
		childList: true,  // 观察目标子节点的变化，是否有添加或者删除
		attributes: true, // 观察属性变动
		subtree: true     // 观察后代节点，默认为 false
	});

	//当窗口滚动时判断是否在底部
	window.addEventListener("scroll", function() {
		isOnBottom = window.scrollY + window.innerHeight >= document.body.scrollHeight;
	});

});






