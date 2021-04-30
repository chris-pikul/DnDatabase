import Reference, { MakeReference, NullReference, ReferenceItem, ReferenceLanguage, ReferenceSkill } from '../reference';
import Resource, { IResource } from '../resource';
import { ResourceType } from '../resource-type';
import { MakeOptionsArray, OptionsArray } from '../options';
import RollTable, { MakeRollTable } from '../roll-table';
import TextSection, { NullTextSection } from '../text-section';
import { IsPlainObject, JSONObject } from '../utils/json-object';
import { TestIfPositiveInteger } from '../utils/validation';

export interface ICharacterOptionals<ObjectType> {
    /**
     * The starting items that are provided as standard
     * wares, not requiring and choosing.
     */
    starting : Array<ObjectType>;

    /**
     * An available list of options that can be chosen
     * from. Each entry in this array is an option
     * within themselves, so they should be "compounded"
     * for each index.
     */
    options : OptionsArray<ObjectType>;
}

export interface IBackgroundProficienciesLanguages extends ICharacterOptionals<ReferenceLanguage> {
    /**
     * Provides the ability to choose any languages.
     * The amount value tells how many to choose.
     * The "standard" boolean declares wheather languages flagged as "standard" may be chosen.
     * Same for "exotics".
     */
    wildcard : {
        amount : Number;
        standard : boolean;
        exotic : boolean;
    };
}

/**
 * Declares the proficiencies that are provided (or selectable) by this background.
 */
export interface IBackgroundProficiencies {
    skills      ?: ICharacterOptionals<ReferenceSkill>;
    tools       ?: ICharacterOptionals<ReferenceItem>;
    languages   ?: IBackgroundProficienciesLanguages;
}

export const NullBackgroundProficiencies = {
    skills: {
        starting: [],
        options: [],
    },
    tools: {
        starting: [],
        options: [],
    },
    languages: {
        starting: [],
        options: [],
        wildcard: {
            amount: 0,
            standard: false,
            exotic: false,
        },
    },
};

/**
 * Lists the equipment that is provided, and choosable
 * for a background.
 */
export interface IEquipmentItems {
    
    starting : Array<ReferenceItem | Object>

    
    options : OptionsArray<ReferenceItem | Object>
}

/**
 * The equipment "loadout" that is provided as part
 * of the background.
 */
export interface IBackgroundEquipment {
    /**
     * The number of Gold Pieces (GP) that is provided.
     */
    coinPouch : Number

    /**
     * A reference to the clothing item that is provided.
     */
    clothes : ReferenceItem

    /**
     * The remaining items and optional item choices.
     */
    items : ICharacterOptionals<ReferenceItem | Object>
}

export const NullBackgroundEquipment = {
    coinPouch: 0,
    clothes: NullReference,
    items: {
        starting: [],
        options: [],
    },
};

/**
 * Enumeration for the "lifestyle" or budget
 * that characters may have.
 */
 export enum Lifestyle {
    UNKNOWN         = "UNKNOWN",

    WRETCHED        = "WRETCHED",
    SQUALID         = "SQUALID",
    POOR            = "POOR",
    MODEST          = "MODEST",
    COMFORTABLE     = "COMFORTABLE",
    WEALTHY         = "WEALTHY",
    ARISTOCRATIC    = "ARISTOCRATIC",
}

export interface IBackground extends IResource {
    proficiencies   : IBackgroundProficiencies
    equipment       : IBackgroundEquipment

    lifestyle       ?: Lifestyle

    feature         ?: TextSection
    
    traits          ?: RollTable
    ideals          ?: RollTable
    bonds           ?: RollTable
    flaws           ?: RollTable
}

export default class Background extends Resource implements IBackground {
    static readonly JSONSchemaFile = "background.schema.json";

    readonly type : ResourceType = ResourceType.BACKGROUND;

    proficiencies   : IBackgroundProficiencies;
    equipment       : IBackgroundEquipment;
    lifestyle      ?: Lifestyle;
    feature        ?: TextSection;
    traits         ?: RollTable;
    ideals         ?: RollTable;
    bonds          ?: RollTable;
    flaws          ?: RollTable;

    constructor(props:any) {
        super(ResourceType.BACKGROUND, props);

        this.proficiencies = NullBackgroundProficiencies;

        this.equipment = NullBackgroundEquipment;

        this.lifestyle = Lifestyle.UNKNOWN;

        this.feature = NullTextSection;

        if(props && typeof props === "object")
            this.assign(props);
    }

    /**
     * Applies the given properties to this object
     * @param props JSON Object of properties
     */
    assign = (props:any):void => {
        if(!IsPlainObject(props)) return;

        if(props.hasOwnProperty('proficiencies'))
            this.assignProficiencies(props.proficiencies);

        if(props.hasOwnProperty('equipment'))
            this.assignEquipment(props.equipment);

        if(props.hasOwnProperty('lifestyle') && typeof props.lifestyle === 'string' && props.lifestyle.length > 0)
            this.lifestyle = props.lifestyle;

        if(props.hasOwnProperty('traits') && props.traits)
            this.traits = MakeRollTable(props.traits);
        
        if(props.hasOwnProperty('ideals') && props.ideals)
            this.ideals = MakeRollTable(props.ideals);

        if(props.hasOwnProperty('bonds') && props.bonds)
            this.bonds = MakeRollTable(props.bonds);

        if(props.hasOwnProperty('flaws') && props.flaws)
            this.flaws = MakeRollTable(props.flaws);
    }

    assignProficiencies = (props:any):void => {
        if(!IsPlainObject(props)) return;

        if(props.hasOwnProperty('skills') && props.skills && IsPlainObject(props.skills)) {
            this.proficiencies.skills = {
                starting: [],
                options: [],
            };

            if(props.skills.hasOwnProperty('starting') && Array.isArray(props.skills.starting)) {
                this.proficiencies.skills.starting = props.skills.starting.map((ent:any) => (ent && MakeReference(ent)))
                    .filter((ent:(null | Reference)) => (ent && ent.type && ent.type === ResourceType.SKILL)) as Array<ReferenceSkill>;
            }

            if(props.skills.hasOwnProperty('options') && Array.isArray(props.skills.options))
                this.proficiencies.skills.options = MakeOptionsArray<ReferenceSkill>(props.skills.options);
        }

        if(props.hasOwnProperty('tools') && props.tools && IsPlainObject(props.tools)) {
            this.proficiencies.tools = {
                starting: [],
                options: [],
            };

            if(props.tools.hasOwnProperty('starting') && Array.isArray(props.tools.starting)) {
                this.proficiencies.tools.starting = props.tools.starting.map((ent:any) => (ent && MakeReference(ent)))
                    .filter((ent:(null | Reference)) => (ent && ent.type && ent.type === ResourceType.ITEM)) as Array<ReferenceItem>;
            }

            if(props.tools.hasOwnProperty('options') && Array.isArray(props.tools.options))
                this.proficiencies.tools.options = MakeOptionsArray<ReferenceItem>(props.tools.options);
        }

        if(props.hasOwnProperty('languages') && props.languages && IsPlainObject(props.languages)) {
            this.proficiencies.languages = {
                starting: [],
                options: [],
                wildcard: {
                    amount: 0,
                    standard: false,
                    exotic: false,
                },
            };

            if(props.languages.hasOwnProperty('starting') && Array.isArray(props.languages.starting)) {
                this.proficiencies.languages.starting = props.languages.starting.map((ent:any) => (ent && MakeReference(ent)))
                    .filter((ent:(null | Reference)) => (ent && ent.type && ent.type === ResourceType.LANGUAGE)) as Array<ReferenceLanguage>;
            }

            if(props.languages.hasOwnProperty('options') && Array.isArray(props.languages.options))
                this.proficiencies.languages.options = MakeOptionsArray<ReferenceLanguage>(props.languages.options);
        
            if(props.languages.hasOwnProperty('wildcard') && props.languages.wildcard && IsPlainObject(props.languages.wildcard)) {
                if(props.languages.wildcard.hasOwnProperty('amount') && TestIfPositiveInteger(props.languages.wildcard.amount))
                    this.proficiencies.languages.wildcard.amount = props.languages.wildcard.amount as number; //Already type checked
                
                if(props.languages.wildcard.hasOwnProperty('standard') && typeof props.languages.wildcard.standard === 'boolean')
                    this.proficiencies.languages.wildcard.standard = !!props.languages.wildcard.standard;

                if(props.languages.wildcard.hasOwnProperty('exotic') && typeof props.languages.wildcard.exotic === 'boolean')
                    this.proficiencies.languages.wildcard.exotic = !!props.languages.wildcard.exotic;
            }
        }
    }

    assignEquipment = (props:any):void => {
        if(!IsPlainObject(props)) return;

        if(props.hasOwnProperty('coinPouch') && TestIfPositiveInteger(props.coinPouch))
            this.equipment.coinPouch = props.coinPouch as number; //Already type checked

        if(props.hasOwnProperty('clothes') && IsPlainObject(props.clothes)) {
            const ref = MakeReference(props.clothes);
            if(ref.type === ResourceType.ITEM)
                this.equipment.clothes = ref as ReferenceItem;
        }

        if(props.hasOwnProperty('items') && IsPlainObject(props.items)) {
            this.equipment.items = {
                starting: [],
                options: [],
            };

            if(props.items.hasOwnProperty('starting') && Array.isArray(props.items.starting)) {
                this.equipment.items.starting = props.items.starting.map((ent:any) => (ent && MakeReference(ent)))
                    .filter((ent:(null | Reference)) => (ent && ent.type && ent.type === ResourceType.ITEM)) as Array<ReferenceItem>;
            }

            if(props.items.hasOwnProperty('options') && Array.isArray(props.items.options))
                this.equipment.items.options = MakeOptionsArray<ReferenceItem>(props.items.options);
        }
    }

    /**
     * Checks the object properties and validates them against the given schema
     * @returns Array of strings denoting the validation errors found, or empty if none
     */
     validate = ():Array<string> => {
        const errs = Resource.Validate(this);

        return errs;
    };
}