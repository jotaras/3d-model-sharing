const config = {
    PORT: 3010,
    mongodb: `mongodb://${process.env.MONGODB_LOCATION}`,
    storagePath: process.env.FILE_STORAGE_PATH,
    signUrlSecret: process.env.URL_SIGNING_SECRET,
    signedUrlExpiryTime: 60, //seconds
    domainName: 'localhost',
};

export const SUPPORTED_MODEL_EXTENSIONS = Object.freeze({
    OBJ: '.obj',
    STL: '.stl',
    GLTF: '.gltf',
    GLB: '.glb',
});

export const SUPPORTED_IMAGE_EXTENSIONS = Object.freeze({
    JPG: '.jpg',
    JPEG: '.jpeg',
    JFIF: '.jfif',
    PJPEG: '.pjpeg',
    PJP: '.pjp',
    GIF: '.gif',
    PNG: '.png'
});

export default config;
