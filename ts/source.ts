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