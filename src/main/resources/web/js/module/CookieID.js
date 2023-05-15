class CookieID {
    static _cookieID;

    static get cookieID() {
        return this._cookieID;
    }

    static set cookieID(value) {
        this._cookieID = value;
        console.log("cookieID已设置为"+CookieID.cookieID);
    }
}
//指定使用的cookieID
let pa = new URLSearchParams(window.location.search);
let id = pa.get("cookieID");
if(id){
    CookieID.cookieID = id;
}

export default CookieID;