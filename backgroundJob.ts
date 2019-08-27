export default class BackgroundJob
{
    public static SecondInterval: number = 1000;
    public static MinuteInterval: number = 60 * BackgroundJob.SecondInterval;
    public static HourInterval: number = 60 * BackgroundJob.MinuteInterval;

    static Run(callback: Function, millisecondInterval: number)
    {
        setInterval(callback, millisecondInterval);
    }
}