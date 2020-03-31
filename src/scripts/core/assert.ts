export default class Assert
{
    public static IsTrue(cond: boolean, msg: string = "참이어야 하는데 참이 아닙니다.")
    {
        if (!cond)
        {
            throw new Error(msg);
        }
    }

    public static IsFalse(cond: boolean, msg: string = "거짓이어야 하는데 거짓이 아닙니다.")
    {
        if (cond)
        {
            throw new Error(msg);
        }
    }

    public static ShowDefaultMessageIfFalse(cond: boolean)
    {
        if (cond)
        {
            throw new MessageUndefinedError();
        }
    }
}

export class MessageUndefinedError extends Error
{
}