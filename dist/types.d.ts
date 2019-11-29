export declare type SimpleObject = {
    [p: string]: any;
};
export declare type HookFunctionType<T extends SimpleObject> = () => T;
export interface EmptyPropsType {
    onUpdate(v: SimpleObject): void;
    hook: any;
}
