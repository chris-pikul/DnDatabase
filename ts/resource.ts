import { IValidatable } from './validatable';
import { ResourceType } from './resource-type';

import { TestURI, TestKabob } from './utils/validation';

import TextBlock from './text-block';
import Source, { ValidateSource } from './source';

/**
 * Schema: /resource.schema.json
 */
export interface IResource {
    /**
     * The enumerated type string that this resource represents
     */
    readonly type   : ResourceType;

    /**
     * A unique ID (within the scope of the resource's type)
     * representing this resource.
     * Should be formatted as a lowercase kabob string.
     * 
     * ex: "some-object"
     */
    readonly id     : string;

    /**
     * The unique URI for this resource.
     * This path should be relative to the root and include
     * the folder of the resource type.
     * Additionally, it is expected to start with the forward
     * slash.
     * 
     * ex: "/example/some-object"
     */
    readonly uri    : string;

    /**
     * The name of this object, in human readable format.
     * 
     * ex: "Some Object"
     */
    readonly name   : string;

    /**
     * A decription of the resource, as would be displayed
     * to the user.
     * 
     * This is a TextBlock type, meaning it's an object
     * with keys for plainText, markdown, and html to help
     * formatting.
     */
    description     : TextBlock;

    /**
     * Declares the publication sources for this resource
     */
    source          : Source;

    /**
     * An array(set) of tags for searchability.
     * 
     * Each tag should be lowercase kabob format,
     * and no duplicates should be included.
     * The id does not need to be supplied as a tag.
     */
    tags            : Array<string>;
}

/**
 * An abstract class representing the basis of any resource.
 * 
 * Schema: /resource.schema.json
 */
export default abstract class Resource implements IResource, IValidatable {
    readonly type   : ResourceType;

    readonly id     : string;
    readonly uri    : string;
    readonly name   : string;

    description : TextBlock = {
        plainText: [],
    };

    source : Source = {
        publicationID: 'HB',
    };

    tags : Array<string> = [];

    constructor(args:ResourceType|object, props?:object) {
        let obj:any = {};
        if(typeof args === 'string') {
            //First argument is the type value
            this.type = args as ResourceType;

            if(props && typeof props === 'object')
                obj = props;
        } else if(typeof args === 'object') {
            //Using the first argument as the prop object
            obj = args;
        } else {
            throw new TypeError(`Class "Resource" constructor expected first parameter to be either a string of the resource type, or a valid JSON object, instead received a "${typeof args}".`);
        }

        if(obj.hasOwnProperty('type') && typeof obj.type === 'string')
            this.type = obj.type as ResourceType;
        else
            throw new Error(`Cannot construct a Resource without a valid type`);
        
        if(obj.hasOwnProperty('id') && typeof obj.id === 'string')
            this.id = obj.id;
        else
            throw new Error(`Cannot construct a Resource without a valid id`);

        if(obj.hasOwnProperty('uri') && typeof obj.uri === 'string')
            this.uri = obj.uri;
        else
            throw new Error(`Cannot construct a Resource without a valid uri`);

        if(obj.hasOwnProperty('name') && typeof obj.name === 'string')
            this.name = obj.name;  
        else
            throw new Error(`Cannot construct a Resource without a valid name`);

        if(obj.hasOwnProperty('description')) {
            //These could be different for version reasons
            if(typeof obj.description === 'string') {
                //Plain text
                this.description = {
                    plainText: obj.description.split('\n'),
                };
            } else if(Array.isArray(obj.description)) {
                this.description = {
                    plainText: obj.description,
                };
            } else if(typeof obj.description === 'object' && obj.description.hasOwnProperty('plainText')) {
                this.description = obj.description;
            } else {
                throw new TypeError(`Invalid description property, expected string|array|object, instead found ${typeof obj.description}.`);
            }
        } else
            throw new Error(`Cannon construct a Resource without a valid description`);

        if(obj.hasOwnProperty('source')) {
            //These could be different for version reasons
            if(typeof obj.source === 'string') {
                //It's just the publication ID
                this.source = {
                    publicationID: obj.source,
                };
            } else if(typeof obj.source === 'object' && obj.source.hasOwnProperty('publicationID')) {
                this.source = obj.source;
            }
        } else
            throw new Error(`Cannon construct a Resource without a valid source`);

        if(obj.hasOwnProperty('tags') && Array.isArray(obj.tags)) {
            this.tags = obj.tags
                .filter((tag:string) => (typeof tag === 'string' && tag.length > 1));
        }
    }

    static Validate(obj:any):Array<string> {
        const errs = [];

        //Ensure the ID is filled
        if(!obj.id || typeof obj.id !== 'string' || obj.id.length < 1)
            errs.push(`Expected id to be a string of at least 1 character long.`);

        //URI's need to be valid and filled out, the starting
        //character should be a forward slash to help declare the type
        if(!obj.uri || typeof obj.uri !== 'string' || obj.uri.length < 1)
            errs.push(`Resource requires a valid (non-empty) URI string.`);
        else if(!TestURI(obj.uri))
            errs.push(`The format for the URI is invalid. Check that it starts with a forward slash, and is only alphanumeric path segments`);

        //Check that the name is at least filled out
        if(!obj.name || typeof obj.name !== 'string' || obj.name.length < 1)
            errs.push(`Resource requires a valid (non-empty) name string`);

        //Make sure there's at least something in the description
        if(obj.description && typeof obj.description === 'object') {
            if(obj.description.hasOwnProperty('plainText')) {
                if(Array.isArray(obj.description.plainText)) {
                    obj.description.plainText.forEach((txt:string, i:number) => {
                        if(typeof txt !== 'string')
                            errs.push(`Entry #${i} of plaintext description is expected to be a string, instead found a ${typeof txt}.`);
                        else if(txt.length < 1)
                            errs.push(`Entry #${i} of plaintext description is empty, each entry is expected to be a paragraph and therefor filled.`);
                    });
                } else
                    errs.push(`Resource's plaintext description expected to be an array, instead found a ${typeof obj.description.plainText}`);
            } else
                errs.push(`Resource's description requires a plainText property, none found.`);
        
            if(obj.description.hasOwnProperty('markdown')) {
                if(Array.isArray(obj.description.markdown)) {
                    obj.description.markdown.forEach((txt:string, i:number) => {
                        if(typeof txt !== 'string')
                            errs.push(`Entry #${i} of markdown description is expected to be a string, instead found a ${typeof txt}.`);
                        else if(txt.length < 1)
                            errs.push(`Entry #${i} of markdown description is empty, each entry is expected to be a paragraph and therefor filled.`);
                    });
                } else
                    errs.push(`Resource's markdown description expected to be an array, instead found a ${typeof obj.description.markdown}`);
            }

            if(obj.description.hasOwnProperty('html')) {
                if(Array.isArray(obj.description.html)) {
                    obj.description.html.forEach((txt:string, i:number) => {
                        if(typeof txt !== 'string')
                            errs.push(`Entry #${i} of html description is expected to be a string, instead found a ${typeof txt}.`);
                        else if(txt.length < 1)
                            errs.push(`Entry #${i} of html description is empty, each entry is expected to be a paragraph and therefor filled.`);
                    });
                } else
                    errs.push(`Resource's html description expected to be an array, instead found a ${typeof obj.description.html}`);
            }
        } else
            errs.push(`Resource requires a description object, none found.`);

        //Validate the source
        if(obj.source && typeof obj.source === 'object') {
            errs.push.apply(null, ValidateSource(obj.source));
        } else
            errs.push(`Resource requires a source object, none found.`);

        //Check the tag formats
        if(!obj.tags || !Array.isArray(obj.tags)) 
            errs.push(`Resource requires an array of tags, none found.`);
        else {
            obj.tags.forEach((tag:string,i:number) => {
                if(typeof tag !== 'string' || tag.length === 0)
                    errs.push(`Tag entry #${i} should be a non-empty string.`);
                else if(!TestKabob(tag))
                    errs.push(`Tag entry #${i} should be a kabob-case string.`);
            })
        }

        return errs;
    }

    /**
     * Checks the object properties and validates them against the given schema
     * @returns Array of strings denoting the validation errors found, or empty if none
     */
    validate = ():Array<string> => {
        return Resource.Validate(this);
    };

    /**
     * Checks the object properties and validates them against the given schema
     * @returns True if there are no validation errors
     */
    isValid = ():boolean => {
        return this.validate().length == 0;
    };
}