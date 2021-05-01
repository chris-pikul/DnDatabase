import { IAssignable } from './assignable';
import { IsPlainObject, JSONObject } from './utils/json-object';
import { StringArray } from './utils/string-array';
import { IValidatable } from './validatable';

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
export interface ITextBlock {
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

export default class TextBlock implements ITextBlock, IAssignable, IValidatable {
    /**
     * Holds the "Zero" value (empty, null) for easy reference
     * and object instantiation.
     */
    public static readonly ZeroValue:TextBlock = new TextBlock();

    /**
     * Checks if the supplied object is at the class's zero value.
     * @param obj TextBlock object to check
     * @returns True if the object has the default values
     */
    public static IsZeroValue = (obj:TextBlock):boolean => (
           obj.plainText.length === 0
        && obj.markdown.length === 0
        && obj.html.length === 0
    );

    plainText   : StringArray;
    markdown    : StringArray;
    html        : StringArray;

    constructor(props?:any) {
        this.plainText = [];
        this.markdown = [];
        this.html = [];

        //Check if props have been provided
        if(typeof props !== 'undefined' && props !== null) {
            if(props instanceof TextBlock) {
                //If this is another TextSection,
                // copy the properties in.
                this.plainText = [...props.plainText];
                this.markdown = [...props.markdown];
                this.html = [...props.html];
            } else if(IsPlainObject(props)) {
                //If this is a JSON object (plain JS object),
                // attempt to assign the properties.
                this.assign(props);
            } else {
                console.warn(`Attempting to instantiate a TextBody object with an invalid parameter. Expected either a TextBody object, or a plain JSON Object of properties. Instead encountered a "${typeof props}"`);
            }
        }
    }

    assign = (props:JSONObject):void => {
        if(props.hasOwnProperty('plainText') && Array.isArray(props.plainText)) {
            //The filter should handle the case of ensuring strings,
            //so I will explicitly cast the results
            this.plainText = props.plainText.filter(ent => (ent && typeof ent === 'string')) as StringArray;
        }
    
        if(props.hasOwnProperty('markdown') && Array.isArray(props.markdown)) {
            //The filter should handle the case of ensuring strings,
            //so I will explicitly cast the results
            this.markdown = props.markdown.filter(ent => (ent && typeof ent === 'string')) as StringArray;
        }
    
        if(props.hasOwnProperty('html') && Array.isArray(props.html)) {
            //The filter should handle the case of ensuring strings,
            //so I will explicitly cast the results
            this.html = props.html.filter(ent => (ent && typeof ent === 'string')) as StringArray;
        }
    }

    validate = ():Array<string> => {
        const errs:Array<string> = [];

        return errs;
    }

    isValid = ():boolean => (this.validate().length === 0);

    /**
     * Checks if this object is at the class's zero value.
     * @returns True if the this has the default values
     */
    isZeroValue = ():boolean => (TextBlock.IsZeroValue(this));
}
