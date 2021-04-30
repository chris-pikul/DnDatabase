import TextBlock, { NullTextBlock } from './text-block';

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