
export default class WaitFor
{
    public static async Seconds(sec: number): Promise<unknown>
    {
        var ms = sec * 1000;

        return new Promise(resolve => setTimeout(resolve, ms));
    }
}