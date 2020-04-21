export default class TimeAPI
{
    public static GetYYYYMMDD()
    {
        var date = new Date();
        return date.getFullYear() + date.getMonth() + date.getDay();
    }

    public static GetHHMMSS()
    {
        var date = new Date();
        return date.getHours() + date.getMinutes() + date.getSeconds();
    }   
}