import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    path: String,
    realFileName: String,
    metadata: Object,
    createdAt: Date,
    updatedAt: Date
});

const File = mongoose.model('file', fileSchema);
export default File;
