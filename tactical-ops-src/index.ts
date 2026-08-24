import { attachGlobal, API } from "./host/bootstrap";

attachGlobal();

export { API };
export * from "./combat";
