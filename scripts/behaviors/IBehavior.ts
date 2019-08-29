import HandlerResult from "../handlerResult";
import { resolve } from "path";

export default abstract class IBehavior
{
    abstract IsValid(): boolean;
    abstract Result(): Promise<HandlerResult>;
    
    OnFail(): HandlerResult
    {
        return new HandlerResult("help메시지");
    }

    Promisify(value: boolean): Promise<boolean>
    {
        return new Promise((resolve, reject) => {resolve(value);});
    }
}
