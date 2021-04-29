import Reference, { NullReference, ReferenceItem, ReferenceLanguage, ReferenceSkill } from '../reference';
import Resource, { IResource } from '../resource';
import { ResourceType } from '../resource-type';
import { OptionsArray } from '../options';
import RollTable from '../roll-table';
import TextSection from '../text-section';

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

/**
 * Enumeration for the "lifestyle" or budget
 * that characters may have.
 */
 export enum Lifestyle {
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

    proficiencies : IBackgroundProficiencies = {};

    equipment : IBackgroundEquipment = {
        coinPouch: 40,
        clothes: NullReference,
        items: {
            starting: [],
            options: [],
        },
    };

    lifestyle ?: Lifestyle;
    feature ?: TextSection;

    traits  ?: RollTable;
    ideals  ?: RollTable;
    bonds   ?: RollTable;
    flaws   ?: RollTable;

    constructor(props:any) {
        super(ResourceType.BACKGROUND, props);

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