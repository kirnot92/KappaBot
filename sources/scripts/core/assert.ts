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
}

export class LogicHalt
{   
    public static InvaildUsage(key: string)
    {
        throw new InvaildUsageError(key);
    }

    public static CommandNotFound()
    {
        throw new CommandNotFoundError();
    }
}

export class CommandNotFoundError extends Error
{
}

export class InvaildUsageError extends Error
{
    public Key: string

    constructor(key: string)
    {
        super();
        this.Key = key;
    }
}