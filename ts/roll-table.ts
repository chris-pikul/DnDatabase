import { DieSize } from "./die-size";
import TextBlock from "./text-block";

/**
 * An individual result from a roll-table.
 * Each value can be marked with optional
 * minimum, maximum, and absolute values to
 * help determine the results.
 */
export interface RollTableResult {
    value           ?: Number;
    minimumValue    ?: Number;
    maximumValue    ?: Number;

    title           ?: String;

    body            : TextBlock;
};

/**
 * A roll-table, in which a specified die
 * size should be rolled to produce a
 * random result.
 * 
 * Schema: /roll-table.schema.json
 */
export default interface RollTable {
    die     : DieSize

    results : Array<RollTableResult>
};

/**
 * Easy to reference object for empty or "null" data.
 */
export const NullRollTable:RollTable = {
    die: DieSize.UNKNOWN,
    results: [],
}