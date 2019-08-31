import HandlerResult from "../handlerResult";

export interface IBehavior
{
    IsValid(): boolean;
    Result(): Promise<HandlerResult>;
    OnFail(): HandlerResult;
}
