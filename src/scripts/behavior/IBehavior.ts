import HandlerResult from "../HandlerResult";

export interface IBehavior
{
    IsValid(): boolean;
    Result(): Promise<HandlerResult>;
    OnFail(): HandlerResult;
}
