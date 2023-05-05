/**
 * 自定义的fetch，用于返回自定义异常
 * */
export default async function nBGGFetch(url,rr){
    if(!rr){
        rr = {headers:{"NewBingGoGoWeb":"true"}};
    }else if(!rr.headers){
        rr.headers = {"NewBingGoGoWeb":"true"};
    }else {
        rr.headers['NewBingGoGoWeb'] = "true";
    }
   let re = await fetch(url,rr)
   if(re.headers.get('NewBingGoGoError')){
       let json = await re.json();
       let error= new Error(json.message);
       error.value = json.value;
       error.isNewBingGoGoError = true;
       throw error;
   }
   return re;
}