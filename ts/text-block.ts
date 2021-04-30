import { IsPlainObject, JSONObject } from './utils/json-object';
import { StringArray } from './utils/string-array';

/**
 * Represents a block of text, with different
 * formatting options available.
 * 
 * Each format should effectively contain the same
 * text, but the formatting specifiers can be
 * different.
 * 
 * At bare minimum, the plain text version is required
 * 
 * Schema: /text-block.schema.json
 */
export default interface TextBlock {
    /**
     * The plain text (no formatting markers) version
     * This is required
     */
    plainText   : StringArray

    /**
     * A markdown (commonmark) formatted version.
     */
    markdown?   : StringArray

    /**
     * An HTML version. The text should be escapped
     * properly for JSON. And should only contain
     * formatting elements such as B, I, U, Em, etc.
     */
    html?       : StringArray
}

/**
 * Easy to reference object for empty or "null" data.
 */
export const NullTextBlock:TextBlock = {
    plainText: [],
    markdown: [],
    html: [],
};

/**
 * Factory function for creating a valid TextBlock from
 * a given JSON object.
 * @param props JSON Object
 * @returns TextBlock object
 */
export function MakeTextBlock(props:JSONObject):TextBlock {
    if(!IsPlainObject(props)) return NullTextBlock;

    const obj:TextBlock = NullTextBlock;

    if(props.hasOwnProperty('plainText') && Array.isArray(props.plainText)) {
        //The filter should handle the case of ensuring strings,
        //so I will explicitly cast the results
        obj.plainText = props.plainText.filter(ent => (ent && typeof ent === 'string')) as StringArray;
    }

    if(props.hasOwnProperty('markdown') && Array.isArray(props.markdown)) {
        //The filter should handle the case of ensuring strings,
        //so I will explicitly cast the results
        obj.markdown = props.markdown.filter(ent => (ent && typeof ent === 'string')) as StringArray;
    }

    if(props.hasOwnProperty('html') && Array.isArray(props.html)) {
        //The filter should handle the case of ensuring strings,
        //so I will explicitly cast the results
        obj.html = props.html.filter(ent => (ent && typeof ent === 'string')) as StringArray;
    }

    return obj;
}