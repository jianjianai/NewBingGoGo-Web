/**
 * 时间格式化的工具类
 * */
export default class DateFormat{
    /**
     * 将时间格式化
     * @param date 要格式化的时间
     * @return {string}
     */
    static format(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return year + "-" + month + "-" + day + " " + hours + "-" + minutes + "-" + seconds;
    }
}