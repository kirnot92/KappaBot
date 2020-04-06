export default class Log
{
    // 추후에 파일로 로깅하는 시스템을 붙이자
    public static Initialize()
    {
        this.Info("Log System Initialized");
    }

    public static Info(message: string)
    {
        message = this.AttachTimestamp(message);

        console.log(message);
    }

    public static Critical(message: string)
    {
        message = this.AttachTimestamp(message);

        // 이건 관리자한테 바로 알려주기
        console.log(message);
    }

    private static AttachTimestamp(msg: string): string
    {
        return "[" + this.GetHHMMSS() + "] " + msg;
    }

    private static GetYYYMMDD(): string
    {
        var now = new Date();
        return (now.getFullYear() + now.getMonth() + now.getDay()).toString();
    }

    private static GetHHMMSS(): string
    {
        var now = new Date();
        var arr = new Array<string>();
        arr.push(now.getHours().toString());
        arr.push(now.getMinutes().toString());
        arr.push(now.getSeconds().toString());

        return arr.join(":");
    }
}