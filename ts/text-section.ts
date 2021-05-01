import { IAssignable } from './assignable';
import { IValidatable } from './validatable';
import { IsPlainObject, JSONObject } from './utils/json-object';

import TextBlock from './text-block';

/**
 * TextSection represents a titled section of text.
 * Essentially, it is a title string, followed by
 * a body text (in the form of a TextBlock object).
 * 
 * Schema: /text-section.schema.json
 */
export interface ITextSection {
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

export default class TextSection implements ITextSection, IAssignable, IValidatable {
    /**
     * Holds the "Zero" value (empty, null) for easy reference
     * and object instantiation.
     */
    public static readonly ZeroValue:TextSection = new TextSection();

    /**
     * Checks if the supplied object is at the class's zero value.
     * @param obj TextSection object to check
     * @returns True if the object has the default values
     */
    public static IsZeroValue = (obj:TextSection):boolean => !!(
           obj.title.length === 0
        && obj.body.isZeroValue()
    );

    /**
     * The title of the section.
     * Expected to be plain text for proper heading formatting.
     */
    title   : string;

    /**
     * The body of the text, represented as a TextBlock
     * for multi-format options.
     */
    body    : TextBlock;

    constructor(props?:any) {
        this.title = "";
        this.body = new TextBlock();

        //Check if props have been provided
        if(typeof props !== 'undefined' && props !== null) {
            if(props instanceof TextSection) {
                //If this is another TextSection,
                // copy the properties in.
                this.title = props.title;
                this.body = props.body;
            } else if(IsPlainObject(props)) {
                //If this is a JSON object (plain JS object),
                // attempt to assign the properties.
                this.assign(props);
            } else {
                console.warn(`Attempting to instantiate a TextSection object with an invalid parameter. Expected either a TextSection object, or a plain JSON Object of properties. Instead encountered a "${typeof props}"`);
            }
        }
    }

    assign = (props:JSONObject):void => {
        if(props.hasOwnProperty('title') && typeof props.title === 'string')
            this.title = props.title;

        if(props.hasOwnProperty('body') && IsPlainObject(props.body)) {
            // The IsPlainObject() function satisfies type checking for us
            this.body.assign(props.body as JSONObject);
        }
    }

    validate = ():Array<string> => {
        const errs:Array<string> = [];

        if(!this.title || typeof this.title !== 'string')
            errs.push(`TextSection.title is expected to be a string, instead found "${typeof this.title}".`);

        errs.push.apply(null, this.body.validate());

        return errs;
    }

    isValid = ():boolean => (this.validate().length === 0);

    /**
     * Checks if this object is at the class's zero value.
     * @returns True if the this has the default values
     */
     isZeroValue = ():boolean => (TextSection.IsZeroValue(this));
}
