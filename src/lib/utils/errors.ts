
const
    HTTP_APPLICATION_ERROR = 400;

export class ApplicationError extends Error {
    private _status: number;
    constructor(message: string, status?: number) {
        super(message);
        this._status = status || HTTP_APPLICATION_ERROR;
    }
}