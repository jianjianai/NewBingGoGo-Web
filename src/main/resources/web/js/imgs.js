let imgsDiv = document.getElementById("imgs");
let createMessage = document.getElementById('createMessage');

/**获取当前页面的git参数

 如果url是 http://example.com/?id=123&name=John&name=Mike
 则返回
 {
  id: "123",
  name: ["John", "Mike"]
}
 */
function getAllQueryStrings() {
    const result = {};
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (var i=0; i<vars.length; i++) {
        const pair = vars[i].split("=");
        if (typeof result[pair[0]] === "undefined") {
            result[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof result[pair[0]] === "string") {
            result[pair[0]] = [result[pair[0]], decodeURIComponent(pair[1])];
        } else {
            result[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return result;
}


function addImg(imgSrc){
    let img = document.createElement("img");
    img.classList.add('display-img');
    img.src = "./img/loading.gif";
    imgsDiv.appendChild(img);
    img.onload = ()=>{
        img.onload = undefined;
        img.src = imgSrc;
        img.onclick = (e)=>{
            window.open(e.target.src, '_blank');
        };
    }
}



window.addEventListener('load',e=>{
    let querys = getAllQueryStrings();
    let imgSrcs = querys.imgs;
    let cm = querys.createmessage;
    if(cm){
        createMessage.innerText = cm.replaceAll('+',' ');
    }
    if(imgSrcs){
        if(imgSrcs instanceof Array){
            for(let i=0;i<imgSrcs.length;i++){
                addImg(imgSrcs[i]);
            }
        }else{
            addImg(imgSrcs);
        }
    }
});