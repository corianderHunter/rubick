export type SimpleObject = { [p: string]: any };

export type HookFunctionType<T extends SimpleObject> = () => T;

export interface EmptyPropsType {
  onUpdate(v: SimpleObject): void;
  hook: any;
}
