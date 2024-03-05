
export default class StringExtension
{
    public static HasValue(values: string[], count: number): boolean
    {
        for (var i = 0; i < count; ++i)
        {
            var value = values[i];
            if (value == null || value.length == 0)
            {
                return false;
            }
        }
        return true;
    }

    public static Slice(args: Array<string>, regExp: RegExp, times: number): Array<string>
    {
        if (times == 0) { return args; }
        var match = regExp.exec(args[args.length -1]);
        if (match == null) { return args; }

        var target = args.pop();
        if (target === undefined)
        {
            return args;
        }
        args.push(target.slice(0, match.index));
        args.push(target.slice(match.index + 1));
        return this.Slice(args, regExp, times -1);
    }

    public static Join(seperator: string, ...values: string[] ): string
    {
        return values.join(seperator);
    }
}