import Resource, { IResource } from '../resource';
import { ResourceType } from '../resource-type';
import { ReferenceAction } from '../reference';
import Source from '../source';
import { CountedArray, CountedArrayElem, StrictValidateCountedArray } from '../utils/arrays';
import { IsPlainObject, JSONObject } from '../utils/json-object';

/**
 * Enumeration for the timing an action can take.
 */
export enum ActionTiming {
    /**
     * The timing is unknown and may be specified more clearly in whatever
     * object, or spell, it's related to. Otherwise it may be up to the DM's
     * discretion.
     */
    VARIES = 'VARIES',

    ACTION = 'ACTION',
    BONUS_ACTION = 'BONUS_ACTION',
    REACTION = 'REACTION',

    /**
     * This action is free to do at any time and is not restricted by combat
     * action economy.
     */
    FREE = 'FREE',
};

/**
 * An Action represents a choice a character performs, generally during the
 * combat phases of play.
 */
export interface IAction extends IResource {
    /**
     * Is this from a "variant" rule source
     */ 
    isVariant : boolean;

    /**
     * If this is a "variant" rule, where is it from
     */
    variantSource ?: Source;

    /**
     * The timings this action uses. Each entry is considered an "OR" operation
     * between them and is up to the DMs discretion.
     * The number within each entry is how many of those "timings" are used.
     * 
     * For example the contents:
     * [
     *  { type: 'ACTION', count: 1 },
     *  { type: 'REACTION', count: 1 },
     * ]
     * 
     * Should be interpretted as the action taking "1 Action" OR "1 Reaction"
     * but not both.
     * 
     * NOTE: The counted values are generally not necessary as everything will 
     * most likely be 1, but is provided for expansion with homebrew.
     */
    timing : CountedArray<ActionTiming>;
};

/**
 * An Action represents a choice a character performs, generally during the
 * combat phases of play.
 */
export default class Action extends Resource implements IAction {
    /**
     * The path to the JSON schmea file matching this type.
     */
    static readonly JSONSchemaFile = "action.schema.json";

    /**
     * The base of the URI path to be used when generating URIs.
     */
     public static readonly URIBase = "/action";

     /**
      * Generates a new URI for this resource using the suggested URI-base of the
      * class and the entities ID.
      * 
      * @param id string of the entity ID.
      * @returns string URI
      */
     public static MakeURI = (id:string) => (`${Action.URIBase}/${id}`);
 
     /**
      * Holds the "Zero" value (empty, null) for easy reference
      * and object instantiation.
      */
     public static readonly ZeroValue:Action = new Action();
 
     /**
      * Checks if the supplied object is at the class's zero value.
      * @param obj Action object to check
      * @returns True if the object has the default values
      */
     public static IsZeroValue = (obj:Action):boolean => (
            obj.isVariant === false
        &&  obj.variantSource === undefined
        &&  obj.timing.length === 0
     );
 
     /**
      * Generates a new Reference (sub-classed) that references the object by the
      * given id and name.
      * 
      * Uses the class defaults for URI generation.
      * 
      * @param id string of the entity ID.
      * @param name string of the entity Name.
      * @returns Reference
      */
     public static MakeRef = (id:string, name:string):ReferenceAction => (
         new ReferenceAction({
             uri: Action.MakeURI(id),
             name,
         })
     );
 
     /**
      * Performs type checking and throws errors if the
      * properties needed are not the right types.
      * Does not fully validate the data within them,
      * but will check for emptyness, or incorrect Enums
      * @throws TypeErrors for invalid properties
      * @param props Incoming properties object
      */
     public static StrictValidateProps = (props:any):void => {
        if(!props)
            throw new TypeError(`Action.StrictValidateProps requires a valid parameter to check, none was given.`);
        
        if(props.isVariant) {
            if(typeof props.isVariant !== 'boolean')
                throw new TypeError(`Action "isVariant" property must be a boolean, instead found "${typeof props.isVariant}.`);
        }

        if(props.variantSource) {
            if(typeof props.variantSource !== 'object')
                throw new TypeError(`Action "variantSource" property must be an object, instead found "${typeof props.variantSource}.`);
            Source.StrictValidateProps(props.variantSource);
        }

        if(!props.timing)
            throw new TypeError(`Missing "timing" array for Action.`);
        if(typeof props.timing !== 'object' || !Array.isArray(props.timing))
            throw new TypeError(`Action "timing" property must be an array, instead found "${typeof props.timing}".`);
        if(props.timing.length === 0)
            throw new TypeError(`Action "timing" property cannot be empty.`);
        StrictValidateCountedArray(props.timing, "string");
     }

    /**
     * Is this from a "variant" rule source
     */ 
    isVariant : boolean;

     /**
      * If this is a "variant" rule, where is it from
      */
    variantSource ?: Source;
 
     /**
      * The timings this action uses. Each entry is considered an "OR" operation
      * between them and is up to the DMs discretion.
      * The number within each entry is how many of those "timings" are used.
      * 
      * For example the contents:
      * [
      *  { type: 'ACTION', count: 1 },
      *  { type: 'REACTION', count: 1 },
      * ]
      * 
      * Should be interpretted as the action taking "1 Action" OR "1 Reaction"
      * but not both.
      * 
      * NOTE: The counted values are generally not necessary as everything will 
      * most likely be 1, but is provided for expansion with homebrew.
      */
    timing : CountedArray<ActionTiming>;

    constructor(props?:any) {
        super(props, {
            type: ResourceType.ACTION,
            uriBase: Action.URIBase,
        });

        // Set defaults
        this.isVariant = false;
        this.timing = [];

        if(typeof props !== 'undefined' && props !== null) {
            if(props instanceof Action) {
                // This is another Action
                // copy the properties in.
                Action.StrictValidateProps(props);
                this.isVariant = !!props.isVariant;
                this.variantSource = new Source(props.variantSource);
                this.timing = [ ...props.timing ];
            } else if(IsPlainObject(props)) {
                // This is a plain JSON object,
                // attempt to assign the properties
                Action.StrictValidateProps(props);
                
                this.assign(props);
            } else {
                console.warn(`Attempting to instantiate an AbilityScore object with an invalid parameter. Expected either an AbilityScore object, or a plain JSON object. Instead encountered a "${typeof props}".`);
            }
        }
    }

    /**
     * Checks the object properties and validates them against the given schema
     * @returns Array of strings denoting the validation errors found, or empty if none
     */
     validate = ():Array<string> => {
        const errs = super.validate();

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