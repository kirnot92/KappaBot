
export default class KappaScript
{
    public static Run(rawStr: string): string
    {
        var startIndex = -1;
        var endIndex = -1;

        var state = "start";
        var switchTarget =new Array<string>();
        var switchText = new Array<string>();

        for (var i=0; i<rawStr.length; ++i)
        {
            switch(state)
            {
                case "start":
                    if (rawStr[i] == "<")
                    {
                        startIndex = i;
                        state = "end";
                    }
                    break;
                case "end":
                    if (rawStr[i] == ">")
                    {
                        endIndex = i;
                        if (startIndex < endIndex)
                        {
                            var substr = rawStr.substr(startIndex + 1, (endIndex - startIndex) - 1);
                            var args = substr.split(":");
            
                            if (args.length != 2)
                            {
                                // 에러 상황에서 그냥 raw 리턴
                                return rawStr;
                            }
            
                            var dateStr = args[1].split("/");
                            // month가 0부터 시작함
                            var targetDate = new Date(Number(dateStr[0]), Number(dateStr[1]) - 1, Number(dateStr[2]));
                            var today = new Date();

                            var diffDay = Math.ceil((targetDate.valueOf() - today.valueOf()) / (60*60*24 * 1000));
                            
                            switchTarget.push(rawStr.substr(startIndex, (endIndex-startIndex)+1));
                            switchText.push(diffDay + "일");

                            state = "start";
                        }
                    }

                    break;
            }
        }

        if (state != "start")
        {   
            // 에러 상황에서 그냥 raw 리턴
            return rawStr;
        }

        var replaced = rawStr;

        for(var i=0; i<switchTarget.length; ++i)
        {
            replaced = replaced.replace(switchTarget[i], switchText[i]);
        }

        return replaced;
    }
}