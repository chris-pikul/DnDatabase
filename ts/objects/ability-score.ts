import Resource, { IResource } from '../resource';
import { ResourceType } from '../resource-type';
import { ReferenceSkill } from '../reference';

export interface IAbilityScore extends IResource {
    /**
     * A 3-letter abbreviation for the ability score.
     */
    abbreviation        : string;

    /**
     * Holds an array of resource references pointing
     * to the skills using this ability score
     */
    skills : Array<ReferenceSkill>;
}

export default class AbilityScore extends Resource implements IAbilityScore {
    static readonly JSONSchemaFile = "ability-score.schema.json";

    abbreviation : string;
    skills : Array<ReferenceSkill>;

    constructor(props:any) {
        super({
            ...props,
            type: ResourceType.ABILITY_SCORE,
        });

        this.abbreviation = "UNK";
        this.skills = [];

        //Only apply properties if there is a object parameter applied
        if(props && typeof props === 'object') {
            if(props.hasOwnProperty('abbreviation') && typeof props.abbreviation === 'string')
                this.abbreviation = props.abbreviation;
            else
                throw new Error(`AbilityScore requires an abbreviation property, none found.`);
        
            if(props.hasOwnProperty('skills') && Array.isArray(props.skills))
                this.skills = props.skills;
            else
                throw new Error(`AbilityScore requires a skills property, none found.`);
        }
    }

    /**
     * Checks the object properties and validates them against the given schema
     * @returns Array of strings denoting the validation errors found, or empty if none
     */
     validate = ():Array<string> => {
        const errs = super.validate();

        if(!this.abbreviation || typeof this.abbreviation !== 'string' || this.abbreviation.length !== 3)
            errs.push(`Ability scores require a 3-letter abbreviation`);

        if(!this.skills || !Array.isArray(this.skills))
            errs.push(`Ability scores require an array of skills, none found`);
        else {
            this.skills.forEach((skl:ReferenceSkill,i:number) => {
                if(skl instanceof ReferenceSkill) {
                    const verrs = skl.validate();
                    if(verrs.length !== 0) {
                        verrs.forEach((err:string) => {
                            errs.push(`Ability score skill #${i} has an error "${err}"`);
                        });
                    }
                }
            });
        }

        return errs;
    };
}