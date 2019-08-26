export default class BackgroundJob
{
    public static HourInterval: number = 60 * 60 * 1000;

    static Run(callback: Function, interval: number)
    {
        setInterval(callback, interval);
    }
}