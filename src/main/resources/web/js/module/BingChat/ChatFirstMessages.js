/**
 * 获取bing第一条消息的类
 * */
export default class ChatFirstMessages{
    bingProposes = [
        '教我一个新单词',
        '我需要有关家庭作业的帮助',
        '我想学习一项新技能',
        '最深的海洋是哪个?',
        '一年有多少小时?',
        "宇宙是如何开始的?",
        "寻找非虚构作品",
        '火烈鸟为何为粉色?',
        '有什么新闻?',
        '让我大笑',
        '给我看鼓舞人心的名言',
        '世界上最小的哺乳动物是什么?',
        '向我显示食谱',
        '最深的海洋是哪个?',
        '为什么人类需要睡眠?',
        '教我有关登月的信息',
        '我想学习一项新技能',
        '如何创建预算?',
        '给我说个笑话',
        '全息影像的工作原理是什么?',
        '如何设定可实现的目标?',
        '金字塔是如何建成的?',
        '激励我!',
        '宇宙是如何开始的?',
        '如何制作蛋糕?'
    ];

    bingmMessages = [
        '好的，我已清理好板子，可以重新开始了。我可以帮助你探索什么?',
        '明白了，我已经抹去了过去，专注于现在。我们现在应该探索什么?',
        '重新开始总是很棒。问我任何问题!',
        '好了，我已经为新的对话重置了我的大脑。你现在想聊些什么?',
        '很好，让我们来更改主题。你在想什么?',
        '谢谢你帮我理清头绪! 我现在能帮你做什么?',
        '没问题，很高兴你喜欢上一次对话。让我们转到一个新主题。你想要了解有关哪些内容的详细信息?',
        '谢谢你! 知道你什么时候准备好继续前进总是很有帮助的。我现在能为你回答什么问题?',
        '当然，我已准备好进行新的挑战。我现在可以为你做什么?'
    ]

    StartMessage = this.bingmMessages[0];
    Proposes = [this.bingProposes[0],this.bingProposes[1],this.bingProposes[2]];
    /**
     获取建议消息
     @return String[]
     */
    async nextStartProposes(){
        this.Proposes[0] = this.bingProposes[Math.floor(Math.random() * this.bingProposes.length)];
        this.Proposes[1] = this.bingProposes[Math.floor(Math.random() * this.bingProposes.length)];
        this.Proposes[2] = this.bingProposes[Math.floor(Math.random() * this.bingProposes.length)];
        return this.Proposes;
    }
    /**
    获取bing的第一条消息
     @return string
    */
    async nextStartMessage(){
        return this.StartMessage = this.bingmMessages[Math.floor(Math.random() * this.bingmMessages.length)];
    }

    /**
     * @return string
     * */
    getStartMessage(){
        return this.StartMessage;
    }

    /**
     * @return string[]
     */
    getStartProposes(){
        return this.Proposes;
    }
}