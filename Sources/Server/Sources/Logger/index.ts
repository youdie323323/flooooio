import { AsyncLocalStorage } from "node:async_hooks";
import { AsyncObjectStack, type StackGuard } from "./Core/StackRuntime.js";
import type { AsyncLocalStorage as WinterCGAsyncLocalStorage } from "./AsyncLocalStorage.js";
import type { ObjectStack } from "./Core/ObjectStack";

export type { AsyncObjectStack, StackGuard };

export function createAsyncObjectStack(): AsyncObjectStack {
    return new AsyncObjectStack(
        new AsyncLocalStorage() as WinterCGAsyncLocalStorage<ObjectStack>,
    );
}