import { describe, expect, it } from "@jest/globals";

import { PositionMapper } from "./position.mapper";

const mapper = new PositionMapper();
const REQUEST: Topics.Position.PlacementRequestedMessage["payload"] = {
    actor: "actor-account",
    realm: "organization-realm",
    input: {
        organization: "organization-a",
        process: "placement-process",
        department: "department-a",
        position: "position-a",
        team: "team-a",
    },
};

describe("PositionMapper", () => {
    describe("confirmed", () => {
        it("preserves the caller, hierarchy and process for confirmation", () => {
            const request = { ...REQUEST, input: { ...REQUEST.input } };

            const result = mapper.confirmed({ request });

            expect(result).toEqual(REQUEST);
        });
    });

    describe("rejected", () => {
        it("adds the rejection reason without mutating the original request", () => {
            const request = { ...REQUEST, input: { ...REQUEST.input } };
            const reason = "team not found";

            const result = mapper.rejected({ request, reason });

            expect(result).toEqual({ ...REQUEST, input: { ...REQUEST.input, reason } });
            expect(request).toEqual(REQUEST);
            expect(request.input).not.toHaveProperty("reason");
        });
    });
});
