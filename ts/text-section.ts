import TextBlock, { MakeTextBlock, NullTextBlock } from './text-block';
import { IsPlainObject, JSONObject } from './utils/json-object';

/**
 * TextSection represents a titled section of text.
 * Essentially, it is a title string, followed by
 * a body text (in the form of a TextBlock object).
 * 
 * Schema: /text-section.schema.json
 */
export default interface TextSection {
    /**
     * The title of the section.
     * Expected to be plain text for proper heading formatting.
     */
    title   : string

    /**
     * The body of the text, represented as a TextBlock
     * for multi-format options.
     */
    body    : TextBlock
}

/**
 * Easy to reference object for empty or "null" data.
 */
export const NullTextSection:TextSection = {
    title: "",
    body: NullTextBlock,
};

/**
 * Factory function to create a valid TextSection from
 * a given JSON Object.
 * @param input JSON Object
 * @returns TextSection
 */
export function MakeTextSection(input:JSONObject):TextSection {
    if(!IsPlainObject(input)) return NullTextSection;

    const obj:TextSection = NullTextSection;

    if(input.hasOwnProperty('title') && typeof input.title === 'string')
        obj.title = input.title;

    if(input.hasOwnProperty('body') && IsPlainObject(input.body)) {
        // The IsPlainObject() function satisfies checking for us
        obj.body = MakeTextBlock(input.body as JSONObject);
    }

    return obj;
}