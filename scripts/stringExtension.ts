
export default class StringExtension
{
    public static HasValue(...values: string[]): boolean
    {
        for (var i = 0; i < values.length; ++i)
        {
            var value = values[i];
            if (value == null || value.length == 0)
            {
                return false;
            }
        }
        return true;
    }
}