import { DieSize, DieSizeHas } from "./die-size";
import TextBlock, { MakeTextBlock, NullTextBlock } from "./text-block";
import { IsPlainObject, JSONObject } from "./utils/json-object";
import { TestIfPositiveInteger } from "./utils/validation";

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

export function MakeRollTableResult(input:JSONObject):(RollTableResult|null) {
    if(!IsPlainObject(input)) return null;

    const obj:RollTableResult = {
        body: NullTextBlock,
    };

    if(input.hasOwnProperty('value') && TestIfPositiveInteger(input.value))
        obj.value = input.value as number; //Already type checked
    else { //The two types are mutually exclusive
        if(input.hasOwnProperty('minimumValue') && TestIfPositiveInteger(input.minimumValue))
            obj.minimumValue = input.minimumValue as number; //Already type checked
        
        if(input.hasOwnProperty('maximumValue') && TestIfPositiveInteger(input.maximumValue))
            obj.maximumValue = input.maximumValue as number; //Already type checked
    }

    if(input.hasOwnProperty('title') && typeof input.title === 'string')
        obj.title = input.title.trim();

    if(input.hasOwnProperty('body') && input.body !== null && typeof input.body === 'object')
        obj.body = MakeTextBlock(input.body as JSONObject);

    return obj;
}

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

export function MakeRollTable(input:JSONObject):RollTable {
    if(!IsPlainObject(input)) return NullRollTable;

    const obj:RollTable = NullRollTable;

    if(input.hasOwnProperty('die') && typeof input.die === 'string' && DieSizeHas(input.die))
        obj.die = input.die as DieSize;

    if(input.hasOwnProperty('results') && input.results !== null && Array.isArray(input.results)) {
        obj.results = input.results.map(ent => MakeRollTableResult(ent as JSONObject))
            .filter(ent => (ent && ent !== null)) as Array<RollTableResult>;
    }

    return obj;
}