import * as Secret from "../../json/secret.json";
import Global from "./global.js";
import Dictionary from "../collection/dictionary.js";
import {MessageOptions, RichEmbed, Attachment} from "discord.js"
const youtubeThumbnailMaker = require("youtube-thumbnail");
import * as TwitterClient from "twit";
import {Twitter} from "twit";

export default class TwitterApplication
{
    private client: TwitterClient
    private userIds: Array<string>
    private reconnectRequired: boolean;
    private userNameToChannelIdMap: Dictionary<string, string>;

    constructor()
    {
        this.client = new TwitterClient({
            consumer_key: Secret.CounsumerKey,
            consumer_secret: Secret.ConsumerSecret,
            access_token: Secret.AccessToken,
            access_token_secret: Secret.AccessTokenSecret 
        });

        this.userIds = new Array<string>();
        this.userNameToChannelIdMap = new Dictionary<string, string>();
    }

    public async Initialize()
    {
        for (var data of Secret.TwitterUsersUnderWatching)
        {
            var userId = await this.GetUserId(data.UserName);
            this.userIds.push(userId);

            this.userNameToChannelIdMap.Add(data.UserName, data.BroadcastChannelId);

            var channelTag = "<#" + data.BroadcastChannelId + ">";
            await Global.Client.SendDirectMessage(Secret.AdminId, "앞으로 " + channelTag + "채널에 @"+data.UserName+"의 트윗이 올라오게 됩니다.");
        }

        if (this.userIds.length != 0)
        {
            this.WatchTimelines();
        }
    }

    public async Update()
    {
        if (this.reconnectRequired)
        {
            this.reconnectRequired = false;

            await Global.Client.SendDirectMessage(Secret.AdminId, "스트림이 종료되어 재시작합니다.");

            this.WatchTimelines();
        }
    }

    public IsWatchingTimelines()
    {
        return this.userIds.length > 0;
    }

    private async GetUserId(userName: string): Promise<string>
    {
        var userData = await this.client.get("users/show", {screen_name: userName});
        return (userData.data as Twitter.User).id_str;
    }

    private async WatchTimelines()
    {
        this.reconnectRequired = false;

        var userIdsStr = this.userIds.join(",");
        var stream = this.client.stream("statuses/filter", {follow: userIdsStr});

        stream.on("tweet", async (tweet: Twitter.Status) =>
        {
            var userName = tweet.user.screen_name;
            var message = "https://twitter.com/" + userName + "/status/" + tweet.id_str;

            var isRT = tweet.text.startsWith("RT @");
            var youtubeUrl = this.GetYoutubeUrl(tweet.entities.urls);

            if (!isRT && youtubeUrl != null && this.userNameToChannelIdMap.ContainsKey(userName))
            {
                var thumbnail = youtubeThumbnailMaker(youtubeUrl);
                var files = new Array<string>();
                files.push(thumbnail.high.url);
                var option = {files} as (MessageOptions | RichEmbed | Attachment);

                var targetChannelId = this.userNameToChannelIdMap.MustGet(userName);
                await Global.Client.SendMessage(targetChannelId, message, option);
            }
        });

        stream.on("error", async (event)=>
        {
            this.reconnectRequired = true;
            await Global.Client.SendDirectMessage(Secret.AdminId, "에러 발생 " + event);
        });

        stream.on("disconnect", async (event)=>
        {
            this.reconnectRequired = true;
            await Global.Client.SendDirectMessage(Secret.AdminId, "disconnect 발생 " + event);
        });
    }

    private GetYoutubeUrl(urls: Twitter.UrlEntity[]): string
    {
        for (var i = 0; i < urls.length; ++i)
        {
            var url = urls[i];
            if (url.expanded_url.includes("youtu"))
            {
                return url.expanded_url;
            }
        }
        return null;
    }
}