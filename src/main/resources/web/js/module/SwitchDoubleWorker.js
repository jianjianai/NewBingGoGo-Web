/**
 * 一个开关类，但是两个按钮
 * */
export default class SwitchDoubleWorker {
    buttonTurnOn;//打开的按钮
    buttonTurnOff;//关闭的按钮
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
     * @param buttonTurnOff 控制开关的元素，点一下关
     * @param buttonTurnOn 控制开关的元素，点一下开
     * @param change 改变class的元素，当是开启状态时这个元素会被添加 ’open‘ class
     * @param fun  fun(change)当开关状态改变时的回调函数 函数返回 false则阻止开关 change即将要改变到的状态true或false
     * */
    constructor(buttonTurnOn,buttonTurnOff,change,fun) {
        this.buttonTurnOn = buttonTurnOn;
        this.buttonTurnOff = buttonTurnOff;
        this.change = change;
        this.fun = !!fun?fun:()=>{};
        buttonTurnOn.addEventListener('click',()=> {
            this.open = true;
        });
        buttonTurnOff.addEventListener('click',()=> {
            this.open = false;
        });
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


