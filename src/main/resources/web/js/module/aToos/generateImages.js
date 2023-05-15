import nBGGFetch from "./nBGGFetch.js";
import CookieID from "../CookieID.js";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
/**
 * @param text {String} 生成图像的描述
 * @param requestId {String,undefined} 请求id，如果不是对话生成图片可以为undefined
 * @param countF {function} 回调函数，获取当前是第几次请求。
 * @return {[{img:String,mImg:String}]} [...{img:url,mImg:url}...] img:图片url mIng:缩略图url
 * */
export default async function generateImages(text,requestId,countF){
    let theUrls = new URLSearchParams();
    theUrls.append('re', '1');
    theUrls.append('showselective', '1');
    theUrls.append('sude', '1');
    theUrls.append('kseed', '7500');
    theUrls.append('SFX', '2');
    theUrls.append('q', text);
    theUrls.append('iframeid', requestId);
    let theUrl = `${window.location.origin}/images/create?${theUrls.toString()}`;
    let response  = await nBGGFetch(theUrl,
        CookieID.cookieID?{headers:{"cookieID":CookieID.cookieID}}:undefined);
    let html = (await response.text());
    let cookieID = response.headers.get('cookieID');

    //如果返回的是有错误的页面
    let urr = new RegExp('class="gil_err_mt">([^<>]*)</div>').exec(html);
    if(urr && urr[1]){
        let error = `<h3>${urr[1]}</h3>`;
        urr = new RegExp('class="gil_err_sbt">(([^<>]*<(a|div)[^<>]*>[^<>]*</(a|div)>[^<>]*)*)</div>').exec(html);
        if(urr && urr[1]){
            error = error+`<p>${urr[1]}</p>`;
        }
       throw new Error(error);
    }

    //如果没错误就匹配链接获取图片
    urr = new RegExp('"/(images/create/async/results/(\\S*))"').exec(html);
    if(!urr || !urr[1]){
        console.log(html);
        throw new Error("请求图片返回不正确的页面，无法加载图片。");
    }
    let ur = urr[1];
    ur = ur.replaceAll('&amp;','&');
    let imgPageHtmlUrl = `${window.location.origin}/${ur}`;
    for(let count = 1;count<=20;count++){
        if((!!countF)&&(typeof countF =='function')){
            countF(count);
        }
        await sleep(3000);
        let imgPageHtml;
        try{
            imgPageHtml = (await (await nBGGFetch(imgPageHtmlUrl,{headers:{"cookieID":cookieID}})).text());
        }catch(e){
            console.error(e);
            if (e.isNewBingGoGoError) {
                throw e;
            }
        }
        if(!imgPageHtml){
            continue;
        }
        //用正则找全部图片
        let allSrc = imgPageHtml.matchAll(/<img[^<>]*src="([^"]*)"[^<>]*>/g);
        let imgs = [];
        for(let src;!(src=allSrc.next()).done;){
            imgs[imgs.length] = {
                img:src.value[1].split('?')[0],
                mImg:src.value[1].replaceAll('&amp;','&')
            }
        }
        if(imgs.length>0){
            return imgs;
        }else{
            throw new Error("服务器未正常返回图片！");
        }
    }
}