
/**
 * Clamps the given value to be within the given range.
 * 
 * @param value Number to clamp
 * @param min Minimum value, defaults to 0
 * @param max Maximum value, defaults to Number.MAX_VALUE
 * @returns The number, clamped between min, and max.
 */
export function ClampFloat(value:number, min:number=0, max:number=Number.MAX_VALUE):number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Clamps the given value to be within the given range.
 * Will truncate the value to the integral value (removing any fractionals)
 * 
 * @param value Number to clamp
 * @param min Minimum value, defaults to 0
 * @param max Maximum value, defaults to Number.MAX_VALUE
 * @returns The number, clamped between min, and max.
 */
export function ClampInt(value:number, min:number=0, max:number=Number.MAX_VALUE):number {
  return Math.trunc( ClampFloat(value, min, max) );
}

/**
 * Generates a random floating-point number within the range specified
 * @param min Minimum value, inclusive
 * @param max Maximum value, inclusive
 */
export function RandomFloat(min:number=0, max:number=Number.MAX_VALUE):number {
  return Math.random() * (max - min + 1) + min;
}

/**
 * Generates a random integer within the range specified
 * @param min Minimum value, inclusive
 * @param max Maximum value, inclusive
 */
export function RandomInt(min:number=0, max:number=Number.MAX_SAFE_INTEGER):number {
  return Math.floor( RandomFloat(min, max) );
}