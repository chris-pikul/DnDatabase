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