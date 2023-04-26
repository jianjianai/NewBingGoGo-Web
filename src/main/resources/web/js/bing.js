const restart_button = document.getElementById('restart');
const input_text = document.getElementById('input');
const send_button = document.getElementById('send');
const expand  = document.getElementById("expand");

/**
 * 将消息显示到页面的管理类
 * */
class MessageShowManager {
	chatDiv;//聊天消息父元素
	constructor(chatDiv) {
		this.chatDiv = chatDiv;
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
					${chatMessages.nextStartMessage(type)}
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
}
const messageShowManager = new MessageShowManager(
	document.getElementById('chat')
);

/**
 * 聊天模式的切换的管理类
 * */
class ChatModeSwitchingManager{
	ChatType = {
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
	thisChatType = this.ChatType.balance;
	constructor(backgroundDIV,chatTypeChoseCreate,chatTypeChoseBalance,chatTypeChoseAccurate,chatTypeDiv) {
		this.backgroundDIV = backgroundDIV;
		this.chatTypeChoseCreate = chatTypeChoseCreate;
		this.chatTypeChoseBalance = chatTypeChoseBalance;
		this.chatTypeChoseAccurate = chatTypeChoseAccurate;
		this.chatTypeDiv = chatTypeDiv;

		//创造力模式
		chatTypeChoseCreate.onclick = () => {
			if (chatTypeDiv.style.opacity === '0%') {
				return;
			}
			this.setChatModType(this.ChatType.create);
			reSetStartChatMessage(this.ChatType.create);
		}
		//平衡模式
		chatTypeChoseBalance.onclick = () => {
			if (chatTypeDiv.style.opacity === '0%') {
				return;
			}
			this.setChatModType(this.ChatType.balance);
			reSetStartChatMessage(this.ChatType.balance);
		}
		//准确模式
		chatTypeChoseAccurate.onclick = () => {
			if (chatTypeDiv.style.opacity === '0%') {
				return;
			}
			this.setChatModType(this.ChatType.accurate);
			reSetStartChatMessage(this.ChatType.accurate);
		}
	}

	//设置聊天模式
	setChatModType(chatType){
		if (chatType === this.ChatType.create) {//有创造力的
			this.thisChatType = this.ChatType.create;
			this.chatTypeChoseCreate.classList.add('Chose');
			this.chatTypeChoseBalance.classList.remove('Chose');
			this.chatTypeChoseAccurate.classList.remove('Chose');
			this.backgroundDIV.className = 'a';
		} else if (chatType === this.ChatType.create.balance) {//平衡
			this.thisChatType = this.ChatType.create.balance;
			this.chatTypeChoseCreate.classList.remove('Chose');
			this.chatTypeChoseBalance.classList.add('Chose');
			this.chatTypeChoseAccurate.classList.remove('Chose');
			this.backgroundDIV.className = 'b';
		} else if (chatType === this.ChatType.create.accurate) {//精确的
			this.thisChatType = this.ChatType.create.accurate;
			this.chatTypeChoseCreate.classList.remove('Chose');
			this.chatTypeChoseBalance.classList.remove('Chose');
			this.chatTypeChoseAccurate.classList.add('Chose');
			this.backgroundDIV.className = 'c';
		} else {
			console.warn("错误的聊天类型", chatType);
		}
	}

	//显示聊天模式选项
	show(){
		this.chatTypeDiv.style.opacity = '100%';
	}

	//隐藏聊天模式选项
	hide(){
		this.chatTypeDiv.style.opacity = '0%';
	}
}
const chatModeSwitchingManager = new ChatModeSwitchingManager(
	document.getElementById('background'),
	document.getElementById('chatTypeChoseCreate'),
	document.getElementById('chatTypeChoseBalance'),
	document.getElementById('chatTypeChoseAccurate'),
	document.getElementById('chatTypeDiv')
);

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
				if(searchSuggestions.style.opacity==="100%"){
					send(event.target.innerText);
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
				searchSuggestions.style.opacity = '100%';
			} else {
				searchSuggestions.style.opacity = '0%';
			}
		});
		searchSuggestions.style.opacity = '100%';//设置聊天建议显示
	}

	//重置聊天建议到初始状态
	restart() {
		this.searchSuggestions.innerHTML = '';
		chatMessages.nextStartProposes().then((prs)=>{
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
}
const chatSuggestionsManager = new ChatSuggestionsManager(
	document.getElementById('SearchSuggestions')//聊天建议dom
);

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
		let lis = cueWordSelected.getElementsByTagName("li");
		for(let i=lis.length-1;i>=0;i--){
			let li = lis[i];
			cueWordSelectsList.appendChild(li);
		}
	}

//获取提示词文本
	getCutWordString(){
		let lis = cueWordSelected.getElementsByTagName("li");
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
}
const cueWordManager = new CueWordManager(
	document.getElementById("cueWord-selects-list"),//提示词列表dom
	document.getElementById("cueWord-selected"),//已选择的提示词mod
	document.getElementById("cueWord-search-input")//提示词搜索输入框dom
);

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
		this.setSubtitleText('正在连接到魔法. 稍等！');
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
		this.setSubtitleText('正在接受消息.');
	}

	/**
	 * 等待下一条消息时
	 */
	waitingNext(){
		this.setSubtitleText('可以啦！来发送下一条消息吧！');
	}
}
const titleManager = new TitleManager(
	document.getElementById('goGoSubtitle')
);



let onMessageIsOKClose = false;
//(json)
function onMessage(json, returnMessage) {
	if (json.type === "close") {
		isSpeakingFinish();
		if (!onMessageIsOKClose) {
			messageShowManager.addError("聊天异常中断了！可能是网络问题。");
		}
		return;
	}
	if (json.type === 'error') {
		messageShowManager.addError("连接发生错误：" + json.mess);
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
		onSend();
	} else if (event.key === 'Enter' && event.altKey) {
		event.preventDefault();
		// 插入换行符
		input_text.value += "\n";
	}
});


//全局变量
let talk;
let returnMessage;
let isSpeaking = false;


/**重置聊天框和聊天建议到初始状态 */
function reSetStartChatMessage(type) {
	messageShowManager.restart(type);
	chatSuggestionsManager.restart();
	titleManager.restart();
}

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
	messageShowManager.addMyChat(text);
	if (!talk) {
		isAskingToMagic();
		try {
			talk = await createChat(chatModeSwitchingManager.thisChatType);
		}catch (error){
			console.warn(error);
			messageShowManager.addError(error.message);
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
		messageShowManager.addError(error.message);
	}
}



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
		send_button.style.opacity = '100%';
	} else {
		send_button.style.opacity = '0%';
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





//页面加载完成之后执行
window.addEventListener('load',()=>{
	reSetStartChatMessage();
	input_update_input_text_sstyle_show_update({ target: input_text });
	cueWordManager.loadcueWorld().then();
});





