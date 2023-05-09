import nBGGFetch from "./aToos/nBGGFetch.js";

/**
 * 提示词管理器
 * */
export default class CueWordWorker {
    url = './resource/cueWord.json'
    cueWordSelectsList;//提示词列表dom
    cueWordSelected;//已选择的提示词mod
    cueWordSearchInput;//提示词搜索输入框dom
    constructor(cueWordSelectsList,cueWordSelected,cueWordSearchInput) {
        this.cueWordSelectsList = cueWordSelectsList;
        this.cueWordSelected = cueWordSelected;
        this.cueWordSearchInput = cueWordSearchInput;
//添加提示词
        cueWordSelectsList.onclick = (exent)=>{
            if(exent.target.parentElement === cueWordSelectsList){
                cueWordSelected.appendChild(exent.target);
                //exent.target.style.display = 'inline-block';
                this.onChange();
            }
        }
//取消选择提示词
        cueWordSelected.onclick = (exent)=>{
            if(exent.target.parentElement === cueWordSelected){
                cueWordSelectsList.appendChild(exent.target);
                this.onChange();
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

//获取提示词处理后的文本
    /**
     * @param text 消息
     * @return {string}
     */
    getCutWordString(text){
        let lis = this.cueWordSelected.getElementsByTagName("li");
        if(lis.length>0){
            for(let i=0;i<lis.length;i++){
                let li = lis[i];
                let reg = new RegExp(li.dataset.replaceRegExp,'g');
                text = text.replaceAll(reg,li.dataset.replaceTo);
            }
        }
        return text;
    }

//加载提示词,从本地和网络
    async loadcueWorld(){
        try{
            let re = await nBGGFetch(this.url);
            let cueWords = await re.json();

            for(let i=0;i<cueWords.length;i++){
                let cue = cueWords[i];
                let li = document.createElement('li');
                li.innerHTML = cue.name;
                //加载自定义数据
                for(let t in cue){
                    li.dataset[t] = cue[t];
                }
                this.cueWordSelectsList.appendChild(li);
            }
        }catch(r){
            console.warn(r);
        }
    }


    /**
     * 有当提示词更新时
     */
    onChange(){
        console.debug('onChange没重写');
    }
}