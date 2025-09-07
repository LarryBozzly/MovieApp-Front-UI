import type { RouteContext, Commands } from "@vaadin/router";

export function composeGuards(...guards: ((context: RouteContext, commands: Commands) => any | Promise<any>)[]) {
    return async (context: RouteContext, commands: Commands) => {
        for (const guard of guards) {
            const result = await guard(context, commands);
            if (result !== undefined) return result; // stop if a guard prevents navigation
        }
        return undefined; // all guards passed
    };
}
