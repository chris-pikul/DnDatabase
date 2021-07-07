import Resource, { IResource } from '../resource';
import { ResourceType } from '../resource-type';
import { ReferenceAbilityScore, ReferenceSkill } from '../reference';
import { IsPlainObject, JSONObject } from '../utils/json-object';

/**
 * An Ability Score is a given character attribute describing the level
 * of ability they have.
 * 
 * In 5th edition this is Strength, Dexterity, Constitution, Intelligence,
 * Wisdom, and Charisma.
 * 
 * Within the ability score, there are "Skills" that rely on this value.
 */
export interface IAbilityScore extends IResource {
    /**
     * A 3-letter abbreviation for the ability score.
     */
    abbreviation        : string;

    /**
     * Holds an array of resource references pointing
     * to the skills using this ability score
     */
    skills : Array<ReferenceSkill>;
}

/**
 * An Ability Score is a given character attribute describing the level
 * of ability they have.
 * 
 * In 5th edition this is Strength, Dexterity, Constitution, Intelligence,
 * Wisdom, and Charisma.
 * 
 * Within the ability score, there are "Skills" that rely on this value.
 */
export default class AbilityScore extends Resource implements IAbilityScore {
    /**
     * The path to the JSON schmea file matching this type.
     */
    public static readonly JSONSchemaFile = "ability-score.schema.json";

    /**
     * The base of the URI path to be used when generating URIs.
     */
    public static readonly URIBase = "/ability-score";

    /**
     * Generates a new URI for this resource using the suggested URI-base of the
     * class and the entities ID.
     * 
     * @param id string of the entity ID.
     * @returns string URI
     */
    public static MakeURI = (id:string) => (`${AbilityScore.URIBase}/${id}`);

    /**
     * Holds the "Zero" value (empty, null) for easy reference
     * and object instantiation.
     */
    public static readonly ZeroValue:AbilityScore = new AbilityScore();

    /**
     * Checks if the supplied object is at the class's zero value.
     * @param obj AbilityScore object to check
     * @returns True if the object has the default values
     */
    public static IsZeroValue = (obj:AbilityScore):boolean => (
            obj.abbreviation === "UNK"
        &&  obj.skills.length === 0
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
    public static MakeRef = (id:string, name:string):ReferenceAbilityScore => (
        new ReferenceAbilityScore({
            uri: AbilityScore.MakeURI(id),
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
            throw new TypeError(`AbilityScore.StrictValidateProps requires a valid parameter to check, none was given.`);
        
        if(!props.abbreviation)
            throw new TypeError(`Missing "abbreviation" property for Ability Score.`);
        if(typeof props.abbreviation !== "string")
            throw new TypeError(`AbilityScore "abbreviation" property must be a string, instead found "${typeof props.abbreviation}".`);
        if(props.abbreviation.length !== 3)
            throw new TypeError(`AbilityScore "abbreviation" property should be 3 characters long, instead it has a length of ${props.abbreviation.length}.`);

        if(props.skills) {
            if(!Array.isArray(props.skills))
                throw new TypeError(`AbilityScore "skills" property should be an array, instead found "${typeof props.skills}".`);
            
            // Pass checking skills to the valid checker
            props.skills.forEach( ReferenceSkill.StrictValidateProps );
        }
    }

    /**
     * A 3-letter abbreviation for the ability score.
     * 
     * The default is "UNK" for unknown.
     */
    readonly abbreviation : string;

    /**
     * Holds an array of resource references pointing
     * to the skills using this ability score.
     */
    skills : Array<ReferenceSkill>;

    constructor(props?:any) {
        super(props);

        // Set defaults
        this.abbreviation = "UNK";
        this.skills = [];

        if(typeof props !== 'undefined' && props !== null) {
            if(props instanceof AbilityScore) {
                // This is another AbilityScore
                // copy the properties in.
                AbilityScore.StrictValidateProps(props);
                this.abbreviation = props.abbreviation;
                this.skills = [ ...props.skills ];
            } else if(IsPlainObject(props)) {
                // This is a plain JSON object,
                // attempt to assign the properties
                AbilityScore.StrictValidateProps(props);

                if(props.abbreviation && typeof props.abbreviation === 'string' && props.abbreviation.length === 3)
                    this.abbreviation = props.abbreviation.toUpperCase();
                
                this.assign(props);
            } else {
                console.warn(`Attempting to instantiate an AbilityScore object with an invalid parameter. Expected either an AbilityScore object, or a plain JSON object. Instead encountered a "${typeof props}".`);
            }
        }
    }

    assign = (props:JSONObject):void => {
        super.assign(props);

        if(props.hasOwnProperty('skills') && Array.isArray(props.skills))
            this.skills = props.skills.map((ent:any) => new ReferenceSkill(ent));
    }

    /**
     * Checks the object properties and validates them against the given schema
     * @returns Array of strings denoting the validation errors found, or empty if none
     */
    validate = ():Array<string> => {
        const errs = super.validate();

        if(!this.abbreviation || typeof this.abbreviation !== 'string' || this.abbreviation.length !== 3)
            errs.push(`Ability scores require a 3-letter abbreviation`);

        if(!this.skills || !Array.isArray(this.skills))
            errs.push(`Ability scores require an array of skills, none found`);
        else {
            this.skills.forEach((skl:ReferenceSkill,i:number) => {
                if(skl instanceof ReferenceSkill) {
                    const verrs = skl.validate();
                    if(verrs.length !== 0) {
                        verrs.forEach((err:string) => {
                            errs.push(`Ability score skill #${i} has an error "${err}"`);
                        });
                    }
                }
            });
        }

        return errs;
    };

    /**
     * Generates a new URI for this resource using the suggested URI-base of the
     * class and the entities ID.
     * @returns string URI
     */
    makeURI = ():string => (`${AbilityScore.URIBase}/${this.id}`);

    /**
     * Generates a new Reference object pointing to this object.
     * 
     * @returns ReferenceAbilityScore
     */
    makeRef = ():ReferenceAbilityScore => (new ReferenceAbilityScore(this));
}