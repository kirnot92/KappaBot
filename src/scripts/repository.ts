import Dictionary from "../scripts/collection/dictionary";

var jsonFolder = "../json/";
var examplePostfix = ".example";
var jsonExt = ".json";

class Repository
{
    fileName: string
    repo: Dictionary<string, string>

    constructor(fileName: string)
    {
        this.repo = new Dictionary<string, string>();
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
}

var Playing = new Repository("playing");
var Config = new Repository("config");
var SystemMessage = new Repository("systemMessage");

export { Playing };
export { Config };
export { SystemMessage };

