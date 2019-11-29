import { HookFunctionType } from "./types";
export * from "./types";
declare const createRubickHook: <T>(hook: HookFunctionType<T>) => () => T;
export default createRubickHook;
