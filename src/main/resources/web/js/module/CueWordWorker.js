import nBGGFetch from "./aToos/nBGGFetch.js";

/**
 * 提示词管理器
 * */
export default class CueWordWorker {
    url = './resource/CueWord.json'
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
            let re = await nBGGFetch(this.url);
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