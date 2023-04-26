const chat = document.getElementById('chat');
/**
 创建一个新对话
 */
async function createChat(theChatType) {
	class SendMessageManager {
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
			let optionsSets = chatOptionsSets.chatTypes[this.optionsSets];
			if(!optionsSets){
				optionsSets = chatOptionsSets.chatTypes.balance;
				console.warn("不存在的ChatType",this.optionsSets);
			}

			let json = {
				"arguments": [{
					"source": chatOptionsSets.source,
					"optionsSets": optionsSets,
					"allowedMessageTypes": chatOptionsSets.allowedMessageTypes,
					"sliceIds": chatOptionsSets.sliceIds,
					"verbosity": "verbose",
					"traceId": this.getUuidNojian(),
					"isStartOfSession": (this.invocationId <= 1),
					"message": await chatOptionsSets.generateMessages(this,chat),
					"conversationSignature": this.conversationSignature,
					"participant": {
						"id": this.clientId
					},
					"conversationId": this.conversationId,
					"previousMessages": (this.invocationId <= 1) ? await chatOptionsSets.getPreviousMessages() : undefined
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
		sendMessageManager;

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
				return new ReturnMessage(chatWebSocket, onMessage);
			} catch (e) {
				console.warn(e);
				throw new Error("无法连接到web服务器，请刷新页面重试:" + e.message);
			}
		}
	}

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
	return new Chat(resjson.conversationId, resjson.clientId, resjson.conversationSignature, theChatType);
}
