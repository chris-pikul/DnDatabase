import { ResourceType, ResourceTypeHas } from './resource-type';
import { IValidatable } from './validatable';

import { TestURI, TestKabob } from './utils/validation';
import { IsPlainObject, JSONObject } from './utils/json-object';

/**
 * References are used to link resources between each other
 * by providing the type, the uri, and the name for display.
 */
export interface IReference {
    readonly type : ResourceType;
    readonly uri : string;
    name : string;
}

/**
 * Holds a reference to another resource.
 * Used to link between different objects.
 * 
 * @throws Error if the required values are not fullfilled
 */
export default class Reference implements IReference, IValidatable {
    readonly type : ResourceType;
    readonly uri : string;
    name : string;

    constructor(props:any = null, ignoreType:boolean=false) {
        this.type = ResourceType.UNKNOWN;
        this.uri = '/';
        this.name = 'Unknown Reference';

        if(ignoreType)
            this.type = ResourceType.UNKNOWN;

        if(props) {
            if(typeof props === 'string') {
                if(ResourceTypeHas(props))
                    this.type = props as ResourceType;
                else
                    throw new Error(`Reference expected the string value for construction to be a valid ResourceType enum.`);
            } else if(props.type === 'object') {
                if(props.hasOwnProperty('type') && typeof props.type === 'string') {
                    if(ResourceTypeHas(props.type))
                        this.type = props.type as ResourceType;
                    else
                        throw new Error(`Reference needs a valid ResourceType enum supplied to the 'type' property, instead found "${props.type}".`);
                } else if(!ignoreType)
                    throw new Error(`Reference expected a valid string 'type' property, none found.`);
            
                if(props.hasOwnProperty('uri') && typeof props.uri === 'string' && props.uri.length > 0)
                    this.uri = props.uri;
                else
                    throw new Error(`Expected a valid string 'uri' property, none found.`);
    
                if(props.hasOwnProperty('name') && typeof props.name === 'string' && props.name.length > 0)
                    this.name = props.name;
                else
                    throw new Error(`Expected a valid string 'name' property, none found.`);
            }
        }
    }

    assign = (props:JSONObject):void => {
        if(!IsPlainObject(props)) return;

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
}

/**
 * Easy to reference object for empty or "null" data.
 */
export const NullReference:Reference = new Reference();

/**
 * Factory function to create new Reference objects from
 * the supplied JSON Object.
 * 
 * This is a noexcept version of the default Reference constructor. 
 * 
 * @param input JSON Object
 * @returns Reference
 */
export function MakeReference(input:JSONObject):Reference {
    if(!IsPlainObject(input)) return NullReference;

    try {
        return new Reference(input);
    } catch(err) {
        return NullReference;
    }
}

export class ReferenceAbilityScore extends Reference {
    readonly type : ResourceType = ResourceType.ABILITY_SCORE;

    constructor(props:any) { super(props, true); }
}

export class ReferenceAction extends Reference {
    readonly type : ResourceType = ResourceType.ACTION;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceBackground extends Reference {
    readonly type : ResourceType = ResourceType.BACKGROUND;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceClass extends Reference {
    readonly type : ResourceType = ResourceType.CLASS;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceClassFeature extends Reference {
    readonly type : ResourceType = ResourceType.CLASS_FEATURE;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceCondition extends Reference {
    readonly type : ResourceType = ResourceType.CONDITION;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceDamageType extends Reference {
    readonly type : ResourceType = ResourceType.DAMAGE_TYPE;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceDeity extends Reference {
    readonly type : ResourceType = ResourceType.DEITY;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceDisease extends Reference {
    readonly type : ResourceType = ResourceType.DISEASE;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceEquipmentPack extends Reference {
    readonly type : ResourceType = ResourceType.EQUIPMENT_PACK;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceFeat extends Reference {
    readonly type : ResourceType = ResourceType.FEAT;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceHazard extends Reference {
    readonly type : ResourceType = ResourceType.HAZARD;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceItem extends Reference {
    readonly type : ResourceType = ResourceType.ITEM;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceItemCategory extends Reference {
    readonly type : ResourceType = ResourceType.ITEM_CATEGORY;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceLanguage extends Reference {
    readonly type : ResourceType = ResourceType.LANGUAGE;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceMagicSchool extends Reference {
    readonly type : ResourceType = ResourceType.MAGIC_SCHOOL;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceMonster extends Reference {
    readonly type : ResourceType = ResourceType.MONSTER;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceProficiency extends Reference {
    readonly type : ResourceType = ResourceType.PROFICIENCY;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceRace extends Reference {
    readonly type : ResourceType = ResourceType.RACE;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceSkill extends Reference {
    readonly type : ResourceType = ResourceType.SKILL;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceSpell extends Reference {
    readonly type : ResourceType = ResourceType.SPELL;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceSubRace extends Reference {
    readonly type : ResourceType = ResourceType.SUB_RACE;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceTrait extends Reference {
    readonly type : ResourceType = ResourceType.TRAIT;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceTrap extends Reference {
    readonly type : ResourceType = ResourceType.TRAP;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceVehicle extends Reference {
    readonly type : ResourceType = ResourceType.VEHICLE;
    
    constructor(props:any) { super(props, true); }
}

export class ReferenceWeaponProperty extends Reference {
    readonly type : ResourceType = ResourceType.WEAPON_PROPERTY;
    
    constructor(props:any) { super(props, true); }
}