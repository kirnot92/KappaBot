import IBehavior from "./IBehavior";
import HandlerResult from "../handlerResult";

export default class DoNothing extends IBehavior
{
    IsValid(): boolean
    {
        return false;
    }
    
    async Result(): Promise<HandlerResult>
    {
        return null;
    }
}