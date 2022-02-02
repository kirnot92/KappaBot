
import * as path from "path"
import * as Config from "../../json/config.json";

const ROOT = path.resolve(__dirname, "..", "..", "..")

export default class Prefix
{
    public static First: string;
    public static prefixs: string[];

    public static Initialize()
    {
        this.prefixs = Config.Prefix.split('');
        if (this.prefixs.length == 0)
        {
            this.First = "$";
        }
        else
        {
            this.First = this.prefixs[0];
        }
    }

    public static IsCommandMessage(msg: string): boolean
    {
        for (var prefix of this.prefixs)
        {
            if (msg.startsWith(prefix))
            {
                return true;
            }
        }
        return false;
    }
}
Prefix.Initialize();