var chat = document.getElementById('chat');
var searchSuggestions = document.getElementById('SearchSuggestions');
searchSuggestions.style.opacity = 1;
var chatTypeDiv = document.getElementById('chatTypeDiv');
var goGoSubtitle = document.getElementById('goGoSubtitle');
var docTitle = document.getElementById('docTitle');
var restart_button = document.getElementById('restart');
var input_text = document.getElementById('input');
var send_button = document.getElementById('send');
let expand  = document.getElementById("expand");
let cueWordSelectsList = document.getElementById("cueWord-selects-list");
let cueWordSelected = document.getElementById("cueWord-selected");
let cueWordSearchInput = document.getElementById("cueWord-search-input");
var thisChatType;

function getCurrentTime() {
	let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	return year + "-" + month + "-" + day + " " + hours + "-" + minutes + "-" + seconds;
}

//(string)
function addMyChat(message) {
	let bobo = document.createElement('div');
	bobo.style.whiteSpace = 'pre-wrap';
	bobo.innerText = message;
	bobo.classList.add('bobo');
	bobo.classList.add('markdown-body');
	let go = document.createElement('div');
	go.classList.add('my');
	go.appendChild(bobo);
	chat.appendChild(go);
}

//(string)
function addError(message) {
	let go = document.createElement('div');
	go.classList.add('error');
	go.innerHTML = message;
	chat.appendChild(go);
}


let onMessageIsOKClose = false;
//(json)
function onMessage(json, returnMessage) {
	if (json.type == "close") {
		isSpeakingFinish();
		if (!onMessageIsOKClose) {
			addError("聊天异常中断了！可能是网络问题。");
		}
		return;
	}
	if (json.type == 'error') {
		addError("连接发生错误：" + json.mess);
		return;
	}
	onMessageIsOKClose = false
	if (json.type == 3) {
		onMessageIsOKClose = true;
		returnMessage.getCatWebSocket().close(1000, 'ok');
	} else if (json.type == 1) {
		porserArguments(json.arguments);
	} else if (json.type == 2) {
		porserType2Item(json.item);
	} else {
		console.log(JSON.stringify(json));
	}
}


//页面逻辑


//回车键发送 ctrl+回车换行
input_text.addEventListener('keydown', (event) => {
	//如果是展开状态就使用默认换行逻辑
	if (expand.classList.contains('open')) {
		return;
	}
	if (event.key === 'Enter' && !event.altKey) {
		event.preventDefault();
		//调用发送消息的函数
		send_button.onclick();
	} else if (event.key === 'Enter' && event.altKey) {
		event.preventDefault();
		// 插入换行符
		input_text.value += "\n";
	}
});


//全局变量
var talk;
var returnMessage;
var isSpeaking = false;


/**重置聊天框和聊天建议到初始状态 */
function reSetStartChatMessage(type) {
	chat.innerHTML = `
		<div class="bing">
			<div class="adaptiveCardsFatherDIV">
				<div class="textBlock markdown-body">
					${nextStartMessage(type)}
				</div>
				<div class="throttling">
					0 / 0
				</div>
			</div>
		</div>
		`;
	searchSuggestions.innerHTML = '';
	nextStartProposes().then((prs)=>{
		prs.forEach((s) => {
			let a = document.createElement('a');
			a.innerHTML = s;
			a.onclick = (even) => {
				if (searchSuggestions.style.opacity >= 1) {
					send(even.target.innerHTML);
				}
			}
			searchSuggestions.appendChild(a);
		});
	});
	goGoSubtitle.innerText = '想发什么呢？让我帮你！';
	docTitle.innerText = 'NewBingGoGo:聊天啦啦啦啦';
}

/**正在创建聊天 */
function isAskingToMagic() {
	isSpeaking = true;
	goGoSubtitle.innerText = '正在连接到魔法. 稍等！';
	send_button.value = '施法中.';
	searchSuggestions.innerHTML = '';
}

/**bing正在回复 */
function isSpeakingStart(chatWithMagic, sendText) {
	isSpeaking = true;
	if (chatWithMagic == undefined) {
		goGoSubtitle.innerText = '准备发送消息.';
	} else if (chatWithMagic) {
		goGoSubtitle.innerText = '正在使用读心术.';
	} else {
		goGoSubtitle.innerText = 'bing正在回复.';
	}
	if (sendText) {
		docTitle.innerText = sendText;
	}
	send_button.value = '响应中.';
	searchSuggestions.innerHTML = '';
}

/**bing回复结束 */
function isSpeakingFinish() {
	send_button.value = '发送';
	goGoSubtitle.innerText = '可以啦！来发送下一条消息吧！';
	isSpeaking = false;
}

async function send(text) {
	if (isSpeaking) {
		return;
	}
	chatTypeDiv.style.opacity = 0;
	addMyChat(text);
	if (!talk) {
		isAskingToMagic();
		let r = await createChat(thisChatType);
		if (!r.ok) {
			addError(r.message);
			isSpeakingFinish();
			return;
		}
		talk = r.obj;
	}
	isSpeakingStart();
	let r = await talk.sendMessage(text, onMessage)
	if (!r.ok) {
		isSpeakingFinish();
		addError(r.message);
		return;
	}
	returnMessage = r.obj;
	isSpeakingStart(r.chatWithMagic, text);
}

send_button.onclick = () => {
	if (isSpeaking) {
		return;
	}
	let text = input_text.value;
	input_text.value = '';
	//连接提示词
	text = text+getCutWordString();
	//清空提示词
	clearCutWordString();

	//显示逻辑
	input_update_input_text_sstyle_show_update({ target: input_text });
	if (!text) {
		alert('什么都没有输入呀！');
		return;
	}

	//发送
	send(text);

	//关闭大输入框
	expand.classList.remove('open');
};

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
	chatTypeDiv.style.opacity = 1;

};



//滚动到底部显示收聊天建议

// 定义一个函数处理滚动事件
function handleScroll() {
	// 获取文档的高度和滚动距离
	var docHeight = document.body.scrollHeight;
	var scrollPos = window.pageYOffset;
	// 如果滚动到底部，显示元素，否则隐藏元素
	if (scrollPos + window.innerHeight >= docHeight - 25) {
		searchSuggestions.style.opacity = 1;
	} else {
		searchSuggestions.style.opacity = 0;
	}
}
// 添加滚动事件监听器
window.addEventListener("scroll", handleScroll);




//选择聊天类型，创造力，平衡，精准
let backgroundDIV = document.getElementById('background');
let chatTypeChoseCreate = document.getElementById('chatTypeChoseCreate');
let chatTypeChoseBalance = document.getElementById('chatTypeChoseBalance');
let chatTypeChoseAccurate = document.getElementById('chatTypeChoseAccurate');
//默认平衡
thisChatType = 'balance';
//创造力模式
chatTypeChoseCreate.onclick = () => {
	if (chatTypeDiv.style.opacity == 0) {
		return;
	}
	setChatModType('create');
	reSetStartChatMessage('create');
}
//平衡模式
chatTypeChoseBalance.onclick = () => {
	if (chatTypeDiv.style.opacity == 0) {
		return;
	}
	setChatModType('balance');
	reSetStartChatMessage('balance');
}
//准确模式
chatTypeChoseAccurate.onclick = () => {
	if (chatTypeDiv.style.opacity == 0) {
		return;
	}
	setChatModType('accurate');
	reSetStartChatMessage('accurate');
}

//设置聊天模式
function setChatModType(chatType) {
	if (chatType == 'create') {//有创造力的
		thisChatType = 'create';
		chatTypeChoseCreate.classList.add('Chose');
		chatTypeChoseBalance.classList.remove('Chose');
		chatTypeChoseAccurate.classList.remove('Chose');
		backgroundDIV.className = 'a';
	} else if (chatType == 'balance') {//平衡
		thisChatType = 'balance';
		chatTypeChoseCreate.classList.remove('Chose');
		chatTypeChoseBalance.classList.add('Chose');
		chatTypeChoseAccurate.classList.remove('Chose');
		backgroundDIV.className = 'b';
	} else if (chatType == 'accurate') {//精确的
		thisChatType = 'accurate';
		chatTypeChoseCreate.classList.remove('Chose');
		chatTypeChoseBalance.classList.remove('Chose');
		chatTypeChoseAccurate.classList.add('Chose');
		backgroundDIV.className = 'c';
	} else {
		console.warn("错误的聊天类型", chatType);
	}
}


// "resourceTypes": [
// 	"main_frame",
// 	"sub_frame",
// 	"stylesheet",
// 	"script",
// 	"image",
// 	"font",
// 	"object",
// 	"xmlhttprequest",
// 	"ping",
// 	"csp_report",
// 	"media",
// 	"websocket",
// 	"webtransport",
// 	"webbundle",
// 	"other"
//   ]


//发送按钮出现逻辑
function input_update_input_text_sstyle_show_update(v) {
	if (v.target.value) {
		send_button.style.opacity = 1;
	} else {
		send_button.style.opacity = 0;
	}
}
input_text.addEventListener("input", input_update_input_text_sstyle_show_update);








//给聊天建议添设置点击事件
async function searchSuggestionsAddOnclick(){
	let adds = document.querySelectorAll("#SearchSuggestions>a");
	for(let add in adds){
		adds[add].onclick = (event)=>{
			if(searchSuggestions.style.opacity>=1){
                send(event.target.innerHTML);
            }
		}
	}
}





//展开和缩小输入框
expand.onclick = ()=>{
	if (!expand.classList.contains('open')) {
		expand.classList.add('open');
		return;
	}
	expand.classList.remove('open');
}
//添加和删除提示词
//添加提示词
cueWordSelectsList.onclick = (exent)=>{
	if(exent.target.parentElement == cueWordSelectsList){
		cueWordSelected.appendChild(exent.target);
		//exent.target.style.display = 'inline-block';
	}
}
//取消选择提示词
cueWordSelected.onclick = (exent)=>{
	if(exent.target.parentElement == cueWordSelected){
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

//清空已选择的提示词
function clearCutWordString(){
	let lis = cueWordSelected.getElementsByTagName("li");
	for(let i=lis.length-1;i>=0;i--){
		let li = lis[i];
		cueWordSelectsList.appendChild(li);
	}
}

//获取提示词文本
function getCutWordString(){
	let lis = cueWordSelected.getElementsByTagName("li");
	let string = '';
	for(let i=0;i<lis.length;i++){
		let li = lis[i];
		string = string+";"+li.dataset.word;
	}
	return string;
}

//加载提示词,从本地和网络
async function loadcueWorld(){
	try{
		let re = await fetch('https://gitee.com/jja8/NewBingGoGo/raw/master/cueWord.json');
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
	
			cueWordSelectsList.appendChild(li);
		}
	}catch(r){
		console.warn(r);
	}
	
}




//页面加载完成之后执行
window.addEventListener('load',()=>{
	reSetStartChatMessage();
	input_update_input_text_sstyle_show_update({ target: input_text });
	loadcueWorld();
});





