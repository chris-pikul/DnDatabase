import Resource, { IResource } from '../resource';
import { ResourceType } from '../resource-type';
import Source from '../source';
import { CountedArray, CountedArrayElem } from '../misc-types';

export enum ActionTiming {
    ACTION = 'ACTION',
    BONUS_ACTION = 'BONUS_ACTION',
    REACTION = 'REACTION',
    VARIES = 'VARIES',
    FREE = 'FREE',
};

export interface IAction extends IResource {
    isVariant : boolean;

    variantSource ?: Source;

    timing : CountedArray<ActionTiming>;
};

export default class Action extends Resource implements IAction {
    static readonly JSONSchemaFile = "action.schema.json";

    isVariant       : boolean;
    variantSource  ?: Source;
    timing          : CountedArray<ActionTiming>;

    constructor(props:any) {
        super(ResourceType.ACTION, props);

        this.isVariant = false;
        this.timing = [];

        //Only apply properties if there is a object parameter applied
        if(props && typeof props === 'object') {
            if(props.hasOwnProperty('isVariant') && typeof props.isVariant === 'boolean')
                this.isVariant = props.isVariant;

            if(props.hasOwnProperty('variantSource') && typeof props.variantSource === 'object' && props.variantSource.hasOwnProperty('publicationID'))
                this.variantSource = props.variantSource;

            if(props.hasOwnProperty('timing') && Array.isArray(props.timing))
                this.timing = props.timing;
        }
    }

    /**
     * Checks the object properties and validates them against the given schema
     * @returns Array of strings denoting the validation errors found, or empty if none
     */
     validate = ():Array<string> => {
        const errs = Resource.Validate(this);

        if(this.timing && Array.isArray(this.timing)) {
            if(this.timing.length == 0)
                errs.push(`Action requires a non-empty array of timings.`);
            else {
                this.timing.forEach((timing:CountedArrayElem<ActionTiming>, i:number) => {
                    if(!timing.type || typeof timing.type !== 'string')
                        errs.push(`Action timing #${i} requires a type string.`);
                    if(!timing.count || typeof timing.count !== 'number' || Number.isInteger(timing.count)===false || timing.count < 0)
                        errs.push(`Action timing #${i} requires a positive integer for a count`);
                });
            }
        } else
            errs.push(`Action requires an array of timings, none found.`);

        return errs;
    };
}