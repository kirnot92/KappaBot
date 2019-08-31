import BehaviorResult from "./behaviorResult";

export interface IBehavior
{
    IsValid(): Promise<boolean>;
    Result(): Promise<BehaviorResult>;
    OnFail(): BehaviorResult;
}
