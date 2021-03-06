import { IValidatable } from './validatable';
import { IAssignable } from './utils/assignable';
import { IsPlainObject, JSONObject } from './utils/json-object';

import { ResourceType, ResourceTypeHas } from './resource-type';
import { TestURI } from './utils/validation';

/**
 * References are used to link resources between each other
 * by providing the type, the uri, and the name for display.
 */
export interface IReference {
    /**
     * The given resource type that this reference points to.
     * Must be of the valid ResourceType enums.
     */
    readonly type : ResourceType;

    /**
     * The relative URI that points to the object in reference.
     */
    readonly uri : string;

    /**
     * An displayable name, should be copied from the referenced
     * object. Used for soft-links so the proper anchor title
     * can be displayed.
     */
    name : string;
}

/**
 * Holds a reference to another resource.
 * Used to link between different objects.
 * 
 * @throws Error if the required values are not fullfilled
 */
export default class Reference implements IReference, IAssignable, IValidatable {
    /**
     * Holds the "Zero" value (empty, null) for easy reference
     * and object instantiation.
     */
    public static readonly ZeroValue:Reference = new Reference();

    /**
     * Checks if the supplied object is at the class's zero value.
     * @param obj Reference object to check
     * @returns True if the object has the default values
     */
    public static IsZeroValue = (obj:Reference):boolean => (
           obj.type === ResourceType.UNKNOWN
        && obj.uri === '/'
        && obj.name === 'Unknown Reference'
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
            throw new TypeError(`Reference.StrictValidateProps requires a valid parameter to check, none was given.`);

        if(!props.type)
            throw new TypeError(`Missing "type" property for Reference.`);
        else if(typeof props.type !== 'string')
            throw new TypeError(`Reference "type" property must be a string, instead found "${typeof props.type}"`);
        else if(!ResourceTypeHas(props.type))
            throw new TypeError(`Reference "type" property must be a valid ResourceType enum, "${props.type}" is not one.`);

        if(!props.uri)
            throw new TypeError(`Missing "uri" property for Reference.`);
        else if(typeof props.uri !== 'string')
            throw new TypeError(`Reference "uri" property must be a string, instead found "${typeof props.uri}".`);
        else if(props.uri.length === 0)
            throw new TypeError(`Reference "uri" property must not be an empty string.`);

        if(props.name && typeof props.name !== 'string')
            throw new TypeError(`Reference "name" must be a string if supplied, instead found "${typeof props.name}".`);
    }
    
    /**
     * The given resource type that this reference points to.
     * Must be of the valid ResourceType enums.
     */
    readonly type : ResourceType;

    /**
     * The relative URI that points to the object in reference.
     */
    readonly uri : string;

    /**
     * An displayable name, should be copied from the referenced
     * object. Used for soft-links so the proper anchor title
     * can be displayed.
     */
    name : string;

    /**
     * Construct a new Reference object.
     * Will copy from an existing Reference object if one is supplied.
     * Otherwise, will take JSON data and type check it before applying
     * the properties.
     * @throws TypeErrors if JSON object is used and there are type errors.
     * @param props Reference | JSON Object
     */
    constructor(props?:any) {
        this.type = ResourceType.UNKNOWN;
        this.uri = '/';
        this.name = 'Unknown Reference';

        if(typeof props !== 'undefined' && props !== null) {
            if(props instanceof Reference) {
                this.type = props.type;
                this.uri = props.uri;
                this.name = props.name;
            } else if(IsPlainObject(props)) {
                //If this is a JSON object (plain JS object),
                // attempt to assign the properties.
                Reference.StrictValidateProps(props);

                //Because of readonly attribute, got to do the others here
                if(props.hasOwnProperty('type') && typeof props.type === 'string' && ResourceTypeHas(props.type))
                    this.type = props.type as ResourceType;
                
                if(props.hasOwnProperty('uri') && typeof props.type === 'string')
                    this.uri = props.uri;

                this.assign(props);
            } else {
                console.warn(`Attempting to instantiate a Reference object with an invalid parameter. Expected either a Reference object, or a plain JSON Object of properties. Instead encountered a "${typeof props}"`);
            }
        }
    }

    assign = (props:JSONObject):void => {
        if(props.hasOwnProperty('name') && typeof props.name === 'string' && props.name.length > 0)
            this.name = props.name;
    }

    validate = ():string[] => {
        const errs:Array<string> = [];
        
        if(this.type === ResourceType.UNKNOWN)
            errs.push(`References cannot have empty or unknown types`);

        if(!TestURI(this.uri))
            errs.push(`References must have a valid uri string`);

        if(typeof this.name !== 'string' || this.name.length < 1)
            errs.push(`References must have a valid (non-empty) string name`);

        return errs;
    }

    isValid = ():boolean => (this.validate().length === 0);

    isZeroValue = ():boolean => (Reference.IsZeroValue(this));
}

export class ReferenceAbilityScore extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.ABILITY_SCORE,
        });
    }
}

export class ReferenceAction extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.ACTION,
        });
    }
}

export class ReferenceBackground extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.BACKGROUND,
        });
    }
}

export class ReferenceClass extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.CLASS,
        });
    }
}

export class ReferenceClassFeature extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.CLASS_FEATURE,
        });
    }
}

export class ReferenceCondition extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.CONDITION,
        });
    }
}

export class ReferenceDamageType extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.DAMAGE_TYPE,
        });
    }
}

export class ReferenceDeity extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.DEITY,
        });
    }
}

export class ReferenceDisease extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.DISEASE,
        });
    }
}

export class ReferenceEquipmentPack extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.EQUIPMENT_PACK,
        });
    }
}

export class ReferenceFeat extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.FEAT,
        });
    }
}

export class ReferenceHazard extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.HAZARD,
        });
    }
}

export class ReferenceItem extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.ITEM,
        });
    }
}

export class ReferenceItemCategory extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.ITEM_CATEGORY,
        });
    }
}

export class ReferenceLanguage extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.LANGUAGE,
        });
    }
}

export class ReferenceMagicSchool extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.MAGIC_SCHOOL,
        });
    }
}

export class ReferenceMonster extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.MONSTER,
        });
    }
}

export class ReferenceProficiency extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.PROFICIENCY,
        });
    }
}

export class ReferenceRace extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.RACE,
        });
    }
}

export class ReferenceSkill extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.SKILL,
        });
    }
}

export class ReferenceSpell extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.SPELL,
        });
    }
}

export class ReferenceSubRace extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.SUB_RACE,
        });
    }
}

export class ReferenceTrait extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.TRAIT,
        });
    }
}

export class ReferenceTrap extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.TRAP,
        });
    }
}

export class ReferenceVehicle extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.VEHICLE,
        });
    }
}

export class ReferenceWeaponProperty extends Reference {
    constructor(props?:any) { 
        super({
            ...(props || {}),
            type: ResourceType.WEAPON_PROPERTY,
        });
    }
}