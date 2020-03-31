import Dictionary from "../scripts/collection/dictionary";

var jsonFolder = "../json/";
var examplePostfix = ".example";
var jsonExt = ".json";

class Repository
{
    fileName: string
    repo: Dictionary<string, any>

    constructor(fileName: string)
    {
        this.repo = new Dictionary<string, any>();
        var customJsonPath = jsonFolder + fileName + jsonExt;
        var defaultJsonPath = jsonFolder + fileName + examplePostfix + jsonExt;

        var customJson = JSON.parse(customJsonPath);
        var defaultJson = JSON.parse(defaultJsonPath);
        for (var key in defaultJson)
        {
            var hasCustomValue = (customJson != null && customJson[key] == "undefined");
            var value = hasCustomValue ? defaultJson[key] : customJson[key];
            this.repo.Add(key, value);
        }
    }

    public Values(): Array<any>
    {
        return this.repo.Values();
    }

    public MustGet(key: string)
    {
        return this.repo.MustGet(key);
    }
}

var Playing = new Repository("playing");
var Config = new Repository("config");
var SystemMessage2 = new Repository("systemMessage");

export { Playing };
export { Config };
export { SystemMessage2 };

