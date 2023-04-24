var expUrl = new RegExp('^(https?://)([-a-zA-z0-9]+\\.)+([-a-zA-z0-9]+)+\\S*$');


function getUuidNojian() {
	return URL.createObjectURL(new Blob()).split('/')[3].replace(/-/g, '');
}

class SendMessageManager {
	//(会话id，客户端id，签名id，是否是开始)
	//(string,string,string,boolena)
	constructor(conversationId, clientId, conversationSignature,invocationId) {
		this.invocationId = invocationId==undefined?1:invocationId;
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
		let optionsSets = chatTypes[this.optionsSets];
		if(!optionsSets){
			optionsSets = chatTypes.balance;
			console.warn("不存在的ChatType",this.optionsSets);
			return;
		}

		let json = {
			"arguments": [{
				"source": source,
				"optionsSets": optionsSets,
				"allowedMessageTypes": allowedMessageTypes,
				"sliceIds": sliceIds,
				"verbosity": "verbose",
				"traceId": getUuidNojian(),
				"isStartOfSession": (this.invocationId <= 1) ? true : false,
				"message": await generateMessages(this,chat),
				"conversationSignature": this.conversationSignature,
				"participant": {
					"id": this.clientId
				},
				"conversationId": this.conversationId,
				"previousMessages": (this.invocationId <= 1) ? await getPreviousMessages() : undefined
			}],
			"invocationId": this.invocationId.toString(),
			"target": "chat",
			"type": 4
		};
		await this.sendJson(chatWebSocket, json);
		this.invocationId++;
	}
}





//处理返回消息的类
class ReturnMessage {
	//(WebSocket,function:可以不传)
	constructor(catWebSocket, lisin) {
		this.catWebSocket = catWebSocket;
		this.onMessage = [(v) => {
			//console.log(JSON.stringify(v))
		}];
		if ((typeof lisin) == 'function') {
			this.regOnMessage(lisin);
		}
		catWebSocket.onmessage = (mess) => {
			//console.log('收到', mess.data);
			let sss = mess.data.split('\u001e');
			for (let i = 0; i < sss.length; i++) {
				if (sss[i] == '') {
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
		catWebSocket.onclose = (mess) => {
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
}
//处理聊天的类
class Chat {
	//theChatType chatTypes变量中的其中一个
	//invocationId 可以不传
	//(string,ture|false|'repeat',string,string,string,theChatType,int|undefined)
	constructor(charID, clientId, conversationSignature, theChatType,invocationId) {
		this.sendMessageManager = new SendMessageManager(charID, clientId, conversationSignature,invocationId);
		if (theChatType) {
			this.sendMessageManager.setChatType(theChatType);
		}
	}
	/**
	 * 返回
	 {
		 ok:true|false，
		 message:显示消息，
		 obj:ReturnMessage对象
	   }
	 当ok等于false时，不返回ReturnMessage
	 * 参数 消息string,当收到消息的函数,当关闭时函数
	 */
	//(string,function:可以不传)
	async sendMessage(message, onMessage) {
		try {
			let restsrstUrl = 'wss://sydney.bing.com/sydney/ChatHub';
			let chatWithMagic = await getChatHubWithMagic();
			if (chatWithMagic) {
				let magicUrl = await getMagicUrl();
				if(!expUrl.test(magicUrl)){
					return {
						ok: false,
						message: "魔法链接不正确！请修改魔法链接。"
					};
				}
				restsrstUrl = URLTrue(magicUrl.replace('http', 'ws'), "sydney/ChatHub");
			}
			let chatWebSocket = new WebSocket(restsrstUrl);
			chatWebSocket.onopen = () => {
				this.sendMessageManager.sendShakeHandsJson(chatWebSocket);
				this.sendMessageManager.sendChatMessage(chatWebSocket, message);
			}
			return {
				ok: true,
				message: 'ok',
				obj: new ReturnMessage(chatWebSocket, onMessage),
				chatWithMagic: chatWithMagic
			};
		} catch (e) {
			console.warn(e)
			return {
				ok: false,
				message: "发生错误,可能是网络连接错误:" + e.message
			};
		}
	}
}

/***
 * 补齐url
 */
function URLTrue(magicUrl, thiePath) {
	let url = magicUrl;
	if (!url.endsWith('/')) {
		url = url + '/';
	}
	url = url + thiePath;
	return url;
}




//创建一个新对话
/**
 返回结构，如果ok等于false则无chat对象
 {
	 ok:true|false,
	 message:显示消息,
	 obj:Cat对象
 }
 */
async function createChat(theChatType) {
	//设置cookies到魔法链接
	let magicUrl = await getMagicUrl();
	if (!magicUrl) {
		return {
			ok: false,
			message: "需要设置魔法链接才能聊天哦！"
		};
	}
	if (!expUrl.test(magicUrl)) {
		return {
			ok: false,
			message: "魔法链接不正确！请修改魔法链接。"
		};
	}	
	try {
		let res = await fetch(URLTrue(magicUrl, 'turing/conversation/create'),{headers:{"NewBingGoGoWeb":"true"}});
		let rText = await res.text();
		if(rText.length<1){
			return {
				ok: false,
				message: "魔法似乎不能正常工作，试试换一个魔法链接？"
			};
		}
		let resjson = JSON.parse(rText);
		if (!resjson.result) {
			console.warn(resjson);
			return {
				ok: false,
				message: "未知错误！"
			};
		}
		if (resjson.result.value != 'Success') {
			let type = resjson.result.value;
			let mess = resjson.result.message;
			if (resjson.result.value == 'UnauthorizedRequest') {
				type = 'NoLogin'
				mess = '首先你需要在bing登录微软账号！请前往 https://cn.bing.com/ 登录微软账号。';
			} else if (resjson.result.value == 'Forbidden') {
				type = 'NoPower'
				mess = '你还没有获得NewBing的使用权限';
			}
			console.warn(resjson);
			return {
				ok: false,
				type: type,
				message: mess
			};
		}
		return {
			ok: true,
			message: 'ok',
			obj: new Chat(resjson.conversationId, resjson.clientId, resjson.conversationSignature, theChatType)
		};
	} catch (e) {
		console.warn(e);
		return {
			ok: false,
			message: "发生错误,可能是魔法链接无法链接:" + e.message
		};
	}

}
