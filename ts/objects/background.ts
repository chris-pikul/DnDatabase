import Resource, { IResource } from '../resource';
import { ResourceType } from '../resource-type';
import TextSection from '../text-section';

export interface IBackground extends IResource {
    feature         ?: TextSection
}

export default class Background extends Resource implements IBackground {
    static readonly JSONSchemaFile = "background.schema.json";

    readonly type : ResourceType = ResourceType.BACKGROUND;

    constructor(props:any) {
        super(ResourceType.BACKGROUND, props);

    }

    /**
     * Checks the object properties and validates them against the given schema
     * @returns Array of strings denoting the validation errors found, or empty if none
     */
     validate = ():Array<string> => {
        const errs = Resource.Validate(this);

        return errs;
    };
}