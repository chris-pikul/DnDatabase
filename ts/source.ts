import { IsPlainObject, JSONObject, JSONValue } from "./utils/json-object";
import { TestIfPositiveInteger } from "./utils/validation";

/**
 * Maps a publication ID to it's named value
 */
export const PublicationIDMap = {
    "HB": "Homebrew",
    "UA": "Unearthed Arcana",

    "PHB": "Player's Handbook",
    "MM": "Monter Manual",
    "DMG": "Dungeon Master's Guide",
    "SCAG": "Sword Coast Adventurer's Guide",
    "AL": "Adventurer's League",
    "VGM": "Volo's Guide to Monsters",
    "XGE": "Xanthar's Guide to Everything",
    "MTF": "Mordenkainen's Tome of Foes",
    "GGR": "Guildmaster's Guide to Ravnica",
    "SAC": "Sage Advice Compendium",
    "AI": "Aquisitions Incorperated",
    "ERLW": "Eberron: Rising from the Last War",
    "RMR": "Dungeons & Dragons vs. Rick and Morty: Basic Rules",
    "EGW": "Explorer's Guide to Wildemount",
    "MOT": "Mythic Odysseys of Theros",
    "IDRotF": "Icewind Dale: Rime of the Frostmaiden",
    "TCE": "Tasha's Cauldron of Everything",
};

/**
 * Enumeration of the standard Publication IDs
 */
export enum PublicationID {
    HB = "HB",  // Homebrew
    UA = "UA",  // Unearthed Arcana (BETA)

    PHB = "PHB",
    MM = "MM",
    DMG = "DMG",
    SCAG = "SCAG",
    AL = "AL",
    VGM = "VGM",
    XGE = "XGE",
    MTF = "MTF",
    GGR = "GGR",
    SAC = "SAC",
    AI = "AI",
    ERLW = "ERLW",
    RMR = "RMR",
    EGW = "EGW",
    MOT = "MOT",
    IDRotF = "IDRotF",
    TCE = "TCE",
};

/**
 * Used to describe an additonal source (outside of the primary)
 * that this resource is also printed on.
 */
export interface AdditionalSource {
    /**
     * A short abbreviated name of the publication.
     * used as an enum.
     * REQUIRED
     */
     publicationID       : PublicationID | string;

     /**
      * The real publication name, as displayed to the user.
      * REQUIRED
      */
     title              ?: string;
 
     /**
      * The page number that the resource is on
      */
     page               ?: number;
 
     /**
      * Is this resource part of the Unearthed Arcana (beta)?
      */
     isUA               ?: boolean;
 
     /**
      * Is this part of the System Resource Document (open source)?
      */
     isSRD              ?: boolean;
}

/**
 * Describes the written work, or source body that the resource
 * originates from.
 * 
 * Schema: /source.schema.json
 */
export default interface Source {
    /**
     * A short abbreviated name of the publication.
     * used as an enum.
     * REQUIRED
     */
    publicationID       : PublicationID | string;

    /**
     * The real publication name, as displayed to the user.
     * REQUIRED
     */
    title              ?: string;

    /**
     * The page number that the resource is on
     */
    page               ?: number;

    /**
     * Is this resource part of the Unearthed Arcana (beta)?
     */
    isUA               ?: boolean;

    /**
     * Is this part of the System Resource Document (open source)?
     */
    isSRD              ?: boolean;

    /**
     * Any additional publications this is featured on
     */
    additional         ?: Array<AdditionalSource>;
}

/**
 * Easy to reference object for empty or "null" data.
 */
export const NullSource:Source = {
    publicationID: PublicationID.HB,
    title: "Untitled",
    page: 0,
    isUA: false,
    isSRD: false,
    additional: [],
};

/**
 * Factory function for creating a valid Source from
 * a given JSON object.
 * @param input JSON Object
 * @returns Source
 */
export function MakeSource(input:JSONObject):Source {
    if(!IsPlainObject(input)) return NullSource;

    const obj:Source = NullSource;

    if(input.hasOwnProperty('publicationID') && typeof input.publicationID === 'string')
        obj.publicationID = input.publicationID.trim().toUpperCase();

    if(input.hasOwnProperty('title') && typeof input.title === 'string')
        obj.title = input.title.trim();

    if(input.hasOwnProperty('page') && TestIfPositiveInteger(input.page))
        obj.page = input.page as number; //Already type checked

    if(input.hasOwnProperty('isUA') && typeof input.isUA === 'boolean')
        obj.isUA = !!input.isUA;

    if(input.hasOwnProperty('isSRD') && typeof input.isSRD === 'boolean')
        obj.isSRD = !!input.isSRD;

    if(input.hasOwnProperty('additional') && Array.isArray(input.additional)) {
        // The any, and null stuff, is fine since the filter at the end
        // explicitly removes nulls. Which only leaves the valid AdditionalSource
        // objects.
        obj.additional = input.additional.map((ent:any):(AdditionalSource|null) => {
                if(ent===null || !IsPlainObject(ent)) return null;

                const sub:AdditionalSource = NullSource;

                if(ent.hasOwnProperty('publicationID') && typeof ent.publicationID === 'string')
                    sub.publicationID = ent.publicationID.trim().toUpperCase();

                if(ent.hasOwnProperty('title') && typeof ent.title === 'string')
                    sub.title = ent.title.trim();

                if(ent.hasOwnProperty('page') && TestIfPositiveInteger(ent.page))
                    sub.page = ent.page as number; //Already type checked

                if(ent.hasOwnProperty('isUA') && typeof ent.isUA === 'boolean')
                    sub.isUA = !!ent.isUA;

                if(ent.hasOwnProperty('isSRD') && typeof ent.isSRD === 'boolean')
                    sub.isSRD = !!ent.isSRD;

                return sub;
            }).filter(ent => (ent && ent !== null)) as unknown as Array<AdditionalSource>;
    }

    return obj;
}

export function ValidateSource(source:any):Array<string> {
    const errs = [];

    if(source.hasOwnProperty('publicationID')) {
        if(typeof source.publicationID !== 'string' || source.publicationID.length < 1)
            errs.push(`Source requires a valid (non-empty) publicationID string.`);
    } else
        errs.push(`Source requires a publicationID string, none found.`);

    if(source.hasOwnProperty('title')) {
        if(typeof source.title !== 'string')
            errs.push(`Source's title property should be a string, instead found a "${typeof source.title}".`);
        else if(source.title.length === 0)
            errs.push(`Source must have a non-empty title string.`);
    } else
        errs.push(`Source requires a title string, none found.`);

    if(source.hasOwnProperty('page')) {
        if(typeof source.page !== 'number' || !Number.isInteger(source.page))
            errs.push(`Source page must be an integer number.`);
        else if(source.page < 0)
            errs.push(`Source page must be a positive integer.`);
    }

    if(source.hasOwnProperty('isUA')) {
        if(typeof source.isUA !== 'boolean')
            errs.push(`Source "isUA" property must be a boolean, instead found a "${typeof source.isUA}".`);
    }

    if(source.hasOwnProperty('isSRD')) {
        if(typeof source.isUA !== 'boolean')
            errs.push(`Source "isSRD" property must be a boolean, instead found a "${typeof source.isUA}".`);
    }

    if(source.hasOwnProperty('additional')) {
        if(typeof source.additonal !== 'object' || !Array.isArray(source.additional))
            errs.push(`Source's additional property must be an array, instead found a "${typeof source.additional}".`);
        else {
            source.additional.forEach((add:any, i:number) => {
                if(add.hasOwnProperty('publicationID')) {
                    if(typeof add.publicationID !== 'string' || add.publicationID.length < 1)
                        errs.push(`Source additional at index ${i} requires a valid (non-empty) publicationID string.`);
                } else
                    errs.push(`Source additional at index ${i} requires a publicationID string, none found.`);
            
                if(add.hasOwnProperty('title')) {
                    if(typeof add.title !== 'string')
                        errs.push(`Source additional at index ${i}'s title property should be a string, instead found a "${typeof source.title}".`);
                    else if(add.title.length === 0)
                        errs.push(`Source additional at index ${i} must have a non-empty title string.`);
                } else
                    errs.push(`Source additional at index ${i} requires a title string, none found.`);
            
                if(add.hasOwnProperty('page')) {
                    if(typeof add.page !== 'number' || !Number.isInteger(add.page))
                        errs.push(`Source additional at index ${i} page must be an integer number.`);
                    else if(add.page < 0)
                        errs.push(`Source additional at index ${i} page must be a positive integer.`);
                }
            
                if(add.hasOwnProperty('isUA')) {
                    if(typeof add.isUA !== 'boolean')
                        errs.push(`Source additional at index ${i} "isUA" property must be a boolean, instead found a "${typeof source.isUA}".`);
                }
            
                if(add.hasOwnProperty('isSRD')) {
                    if(typeof add.isUA !== 'boolean')
                        errs.push(`Source additional at index ${i} "isSRD" property must be a boolean, instead found a "${typeof source.isUA}".`);
                }
            });
        }
    }

    return errs;
}