/**
 * Checks Enumeration classes for the existance of keys
 * @param enumClass The Enum object/class itself
 * @param key The key being searched for
 * @returns True if the key exists within the Enum object
 */
export const EnumHas = (enumClass:any, key:string):boolean => (
    Object.keys(enumClass).findIndex(k => (k === key)) !== -1
);