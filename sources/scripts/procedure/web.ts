import Log from "../core/log";

var fs = require('fs');
const axios = require('axios');

export default class Web
{
    public  static async Download(url: string, filePath: string)
    {
        var res = await axios.get(url, {responseType: 'stream'});
        try
        {
            res.data.pipe(fs.createWriteStream(filePath));
        }
        catch
        {
            Log.Critical("다운로드에 실패했습니다.\n" +
                         "URL[" + url + "]\n" +
                         "FilePath[" + filePath +"]");
        }
    }
}