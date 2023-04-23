//聊天选项
let chatTypes = {
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
let source = "cib";

//接收消息类型
let allowedMessageTypes = [
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
let sliceIds = [
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
async function generateMessages(sendMessageManager/*消息管理器*/,chatMessageText/*要发送的消息文本*/){
	function timeString() {
		var d = new Date();
		var year = d.getFullYear();
		var month = (d.getMonth() + 1).toString().padStart(2, "0");
		var date = d.getDate().toString().padStart(2, "0");
		var hour = d.getHours().toString().padStart(2, "0");
		var minute = d.getMinutes().toString().padStart(2, "0");
		var second = d.getSeconds().toString().padStart(2, "0");
		var offset = "+08:00"; // 你可以根据需要修改这个值
		var s = year + "-" + month + "-" + date + "T" + hour + ":" + minute + ":" + second + offset;
		return s;
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

async function getPreviousMessages(){
	function getUuid() {
		return URL.createObjectURL(new Blob()).split('/')[3];
	}
	let pos = getStartProposes();
	return [{
	  "text": getStartMessage(),
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