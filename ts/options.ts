/**
 * Provides an alotment of choices that may be
 * chosen from.
 * 
 * The provided "amount" describes how many objects
 * may be chosen from the choices provided.
 * 
 * Each "choices" entry is an array itself that must
 * contain 1 or more objects. In most cases there is
 * only 1. In the case of more than one per the entry,
 * it is treated as an "OR" option.
 * Example:
 *      amount: 2,
 *      choices: [
 *          [ "sword" ],
 *          [ "axe" ],
 *          [ "longbow", "crossbow" ]
 *      ],
 * In this example, 2 options can be chosen. The items
 * "sword", and "axe" can be chosen and the options are
 * satisfied. Or "axe", and "crossbow" can be chosen.
 * But! "longbow" and "crossbow" is not allowed, since
 * the multi-entry array specifies an "OR" condition.
 * 
 */
 export interface IOptions<Type> {
    /**
     * The amount of objects that may be chosen from
     * the "choices" array.
     */
    amount   : Number;

    /**
     * The available choices, each index in the parent
     * array being a single choice. It's child objects
     * being treated as an "OR" statement within the
     * sub-array.
     * 
     * @see IOptions definition for an example
     */
    choices ?: Array<Type>

    /**
     * NOTE: Remember what this was for.
     * My guess is, I was planning on this being for
     * usage with "categories" or generic items such
     * as "melee weapon" meaning any within the category.
     */
    fromAny ?: boolean
}

/**
 * Easy to reference object for empty or "null" data.
 */
export const NullOptions:IOptions<any> = {
    amount: 0,
    choices: [],
    fromAny: false,
}

/**
 * Type alias for an array of options. Usually when used
 * for equipment and character building there is a few
 * choices that combine to build the "loadout".
 * Ex. 2 weapons, 3 trinkets, 1 magic item, etc.
 */
export type OptionsArray<Type> = Array<IOptions<Type>>

/**
 * Easy to reference object for empty or "null" data.
 */
export const NullOptionsArray:OptionsArray<any> = [];