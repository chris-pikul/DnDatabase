/**
 * An array of strings, intended as paragraphs of text.
 */
export type StringArray = string[];

/**
 * Performs an in-place concatenation using Array.prototype.push.
 * This is useful for constant array variables.
 * Accepts multiple parameters, each array will be added
 * @param target The "this" or target array
 * @params argArr Array of values to concat
 * @returns New length of the target array
 */
export function InPlaceConcat<Type>(target:Array<Type>, ...argArr:Array<Array<Type>>):number {
    return Math.max.apply(null, 
        argArr.map((arr:Array<Type>) => (Array.prototype.push.apply(target, argArr)))
    );
}

/**
 * An element of a CountedArray, uses the properties of type and number
 */
export type CountedArrayElem<Type> = {
    /**
     * Enum of the type.
     */
    type : Type;

    count : number;
};

/**
 * Contains an array of objects. Each object
 * has a "type" property of type provided,
 * and a count number. The type property
 * is expected to be an enum.
 */
export type CountedArray<Type> = Array<CountedArrayElem<Type>>;