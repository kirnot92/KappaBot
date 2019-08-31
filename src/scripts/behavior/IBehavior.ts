import HandlerResult from "../handlerResult";

export interface IBehavior
{
    IsValid(): Promise<boolean>;
    Result(): Promise<HandlerResult>;
    OnFail(): HandlerResult;
}
