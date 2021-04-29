/**
 * Regular expression testing for URI formats.
 * 
 * Passes: /some/v4lu3s-go/here
 * Fails: no/prefix/and/$ymbols
 */
export const RegexpURI = /^(?:\/[A-Za-z0-9\-\_]+)+$/g;

/**
 * Tests that the given input is a string and
 * matches the URI format.
 * @param input string to test
 * @param allowEmpty boolean whether to allow empty strings
 * @returns boolean true if the string is valid
 */
export function TestURI(input:string, allowEmpty:boolean=false):boolean {
    if(allowEmpty && input.length === 0)
        return true;
    else if(input.length === 0)
        return false;
    return RegexpURI.test(input);
}

/**
 * Regular expression matching kabob-case text
 * 
 * Passes: any-values01-here
 * Fails: Caps_and-symbols
 */
export const RegexpKabob = /^[a-z0-9\-]+$/g;

/**
 * Tests that the given input is a string and
 * matches the kabob-case format.
 * @param input string to test
 * @param allowEmpty boolean whether to allow empty strings
 * @returns boolean true if the string is valid
 */
 export function TestKabob(input:string, allowEmpty:boolean=false):boolean {
    if(allowEmpty && input.length === 0)
        return true;
    else if(input.length === 0)
        return false;
    return RegexpURI.test(input);
}
