import * as Twitter from "twitter";
import * as Secret from "../../json/secret.json";
import Global from "./global.js";

export default class TwitterApplication
{
    private client: Twitter

    constructor()
    {
        this.client = new Twitter({
            consumer_key: Secret.CounsumerKey,
            consumer_secret: Secret.ConsumerSecret,
            access_token_key: Secret.AccessToken,
            access_token_secret: Secret.AccessTokenSecret 
        });
    }

    public async Initialize()
    {
        for (var data of Secret.TwitterUsersUnderWatching)
        {
            this.WatchTimeline(data.UserName, data.BroadcastChannelId);
        }
    }

    private async WatchTimeline(userName: string, channelId: string)
    {
        var userData = await this.client.get("users/show", {screen_name: userName});
        var userId = userData.id_str;

        var stream = this.client.stream("statuses/filter", {follow: userId});
        stream.on("data", async (event) =>
        {
            var message = "https://twitter.com/" + event.user.screen_name + "/status/" + event.id_str;

            await Global.Client.SendMessage(channelId, message);
        });
    }
}