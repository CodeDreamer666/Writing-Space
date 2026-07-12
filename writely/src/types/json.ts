export type JsonInputObject = {
    readonly [key: string]: JsonInputValue | null | undefined;
};

export type JsonInputArray = readonly (JsonInputValue | null)[];

export type JsonInputValue =
    | string
    | number
    | boolean
    | JsonInputObject
    | JsonInputArray;
