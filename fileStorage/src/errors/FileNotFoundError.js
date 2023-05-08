export default class FileNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'FileNotFoundError';
    }
}
