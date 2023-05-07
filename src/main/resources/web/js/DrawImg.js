import generateImages from "./module/aToos/generateImages.js";


window.addEventListener('load',()=>{
    const startDraw = document.getElementById('startDraw');
    const inputDraw = document.getElementById('inputDraw');
    const imgsDiv = document.getElementById('imgs');

    let isDrawing = false;
    startDraw.onclick = async ()=>{
        if(isDrawing){
            return;
        }
        isDrawing = true;
        startDraw.innerText = '正在生成';
        let text = inputDraw.value;
        if(!text){
            alert("请输入图片描述");
            isDrawing = false;
            startDraw.innerText = '开始作图';
            return;
        }
        let imgs;
        try {
            imgsDiv.innerText = `正在生成'${text}'图片，请稍等..`;
            imgs = await generateImages(text,undefined,(v)=>{
                imgsDiv.innerText = `正在生成'${text}'图片，请稍等..${v}`;
            });
        }catch (error){
            console.warn(error);
            imgsDiv.innerHTML = error.message;
            isDrawing = false;
            startDraw.innerText = '开始作图';
            return;
        }
        imgsDiv.innerHTML = '';
        imgs.forEach((v)=>{
            let img = document.createElement('img');
            img.src = v.mImg;
            imgsDiv.appendChild(img);
            img.onclick = ()=>{
                window.open(v.img);
            }
            //在低分辨率图片加载完成后替换成高分辨率图片
            img.onload = ()=>{
                img.onload = undefined;
                img.src = v.img;
            }
        });
        isDrawing = false;
        startDraw.innerText = '开始作图';
    }
})