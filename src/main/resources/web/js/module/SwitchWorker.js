/**
 * 一个开关类
 * */
export default class SwitchWorker {
    button;//控制开关的按钮元素
    change;//改变css的元素
    fun;

    _open=false;//开关的状态

    get open() {
        return this._open;
    }

    set open(value) {
        if((!!value)!==this._open){
            this.onChange(value);
        }
    }

    /**
     * @param button 控制开关的元素，点一下开，再点一下关闭
     * @param change 改变class的元素，当是开启状态时这个元素会被添加 ’open‘ class
     * @param fun  fun(change)当开关状态改变时的回调函数 函数返回 false则阻止开关 change即将要改变到的状态true或false
     * */
    constructor(button,change,fun) {
        this.button = button;
        this.change = change;
        this.fun = !!fun?fun:()=>{};
        button.addEventListener('click',()=> {
            this.open = !this.open
        })
    }

    onChange(state){
        if(false!==this.fun(state)){
            this._open = state;
            if(this._open){
                this.change.classList.add('open');
            }else {
                this.change.classList.remove('open');
            }
        }
    }
}


