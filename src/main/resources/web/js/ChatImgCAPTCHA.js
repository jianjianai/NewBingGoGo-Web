import nBGGFetch from "./module/aToos/nBGGFetch.js";

const theH1 = document.getElementById("h1");
const theImg = document.getElementById("img");
const theSub = document.getElementById("sub");
const theInput = document.getElementById("input")


function getUuid(){
    return URL.createObjectURL(new Blob()).split('/')[3];
}
async function start(){
    theH1.innerText = '验证码';
    let pa = new URLSearchParams(window.location.search);
    let cookieId = pa.get('cookieID');
    if (!cookieId){
        theH1.innerText = '未指定cookieId，无法加载验证码。';
        return;
    }
    theImg.src = './img/loading.gif';
    let res
    try{
        res = await nBGGFetch(`${window.location.origin}/edgesvc/turing/captcha/create`,{
            headers:{"cookieID":cookieId}
        });
    }catch (error){
        console.warn(error)
        theH1.innerText = error.message;
        return;
    }
    if(!res.ok){
        theImg.src = '';
        theH1.innerText = `错误代码:${res.status}原因:${res.statusText}`
        return;
    }
    let blob = await res.blob();
    theImg.src = URL.createObjectURL(blob);

    //提交按钮
    theSub.onclick = async ()=>{
        theSub.onclick = undefined;
        theImg.src = '';
        let q  = new URLSearchParams();
        q.append("type","visual");
        q.append("id",getUuid());
        q.append("regionId","0");
        q.append("value",theInput.value);
        let res
        try{
            res = await nBGGFetch(`${window.location.origin}/edgesvc/turing/captcha/verify?${q.toString()}`,{
                headers:{"cookieID":cookieId}
            });
        }catch (error){
            console.warn(error);
            theH1.innerText = error.message;
            return;
        }
        if(!res.ok){
            theH1.innerText = `提交失败！错误代码:${res.status}原因:${res.statusText}`;
            return;
        }
        let json = await res.json();
        if(json.statusCode===200&&(json.reason==="Solved"||json.reason==="NoChallengeSession")){
            theH1.innerText = `已解决！✅`;
            theImg.remove();
            theInput.remove();
            theSub.remove();
            setTimeout(()=>{
                let re = pa.get('redirect')
                if (re){
                    window.location = re;
                }
            },1000);
        }else if (json.statusCode===200&&json.reason==="WrongAnswer"){
            theH1.innerText = `验证码错误！`;
            setTimeout(()=>{
                window.location.reload();
            },1000);
        }else {
            theH1.innerText = `发生错误:${json.reason}`;
        }
    }
}

window.addEventListener("load",start);