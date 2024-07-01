import { expect, it } from "vitest";
import { NetworkView } from "./NetworkView";
import { Network } from "./Network";

// TODO: !!!
it("should update as network changes", () => {
    const network = new Network("gridnet");
    const networkView = new NetworkView(network);
});
