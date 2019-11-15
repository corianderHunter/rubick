import React, { Dispatch } from "react";
import ReactDOM from "react-dom";
import { useState } from "react";
import Empty from "./Empty";
import { HookFunctionType, SimpleObject } from "./types";

const createRubickHook = (hook: HookFunctionType) => {
  if (typeof window === "undefined") return;
  let notifySetStateSet = new Set<Dispatch<any>>();
  let renderCount = 0;
  let rst: SimpleObject;
  const dom = document.createElement("div");
  ReactDOM.render(
    <Empty
      hook={hook}
      onUpdate={v => {
        rst = v;
        if (notifySetStateSet.size) {
          notifySetStateSet.forEach(ck => ck(renderCount++));
        }
      }}
    ></Empty>,
    dom
  );
  return () => {
    const [, setState] = useState();
    notifySetStateSet.add(setState);
    return rst;
  };
};

export default createRubickHook;
