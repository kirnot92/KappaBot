export default class Log
{
    // 추후에 파일로 로깅하는 시스템을 붙이자
    public static Initialize()
    {
        this.Info("Log System Initialized");
    }

    public static Info(message: string)
    {
        console.log(message);
    }

    public static Critical(message: string)
    {
        // 이건 관리자한테 바로 알려주기
        console.log(message);
    }
}