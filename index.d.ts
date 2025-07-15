/**
 * Represents the function closure states.
 * @interface ITaskClosures
 */
export interface ITaskClosures {
    /**
     * Whether the function was opened.
     */
    opened: boolean;
    /**
     * Whether the function was closed.
     */
    closed: boolean;
};

/**
 * The ID of a function.
 */
export type FunctionID = `[OVERLOAD_(${string})]`;
