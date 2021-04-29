
export type CountedArrayElem<Type> = {
    /**
     * Enum of the type.
     */
    type : Type;

    count : number;
};

/**
 * Contains an array of objects. Each object
 * has a "type" property of type provided,
 * and a count number. The type property
 * is expected to be an enum.
 */
export type CountedArray<Type> = Array<CountedArrayElem<Type>>;