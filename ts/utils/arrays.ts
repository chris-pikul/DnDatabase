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