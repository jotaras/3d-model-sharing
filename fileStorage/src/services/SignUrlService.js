import SignUrl from 'simple-sign-url';
import config from '../config.js';
import * as Constans from '../constants/Constants.js';

const signUrl = new SignUrl(
    config.signUrlSecret,
    config.signedUrlExpiryTime
);

export const sign = (req, res) => {
    const signedUrl = signUrl.generateSignedUrl(req.body.url, req.body.method);
    const body = {
        signedUrl: signedUrl
    };
    res.send(body);
};

export const verifyUrl = () => signUrl.verifier(
    (req, res, next) => {
        res.status(403).send(Constans.SIGNED_URL_NOT_VALID_ERROR_MESSAGE);
    },
    (req, res, next) => {
        res.status(410).send(Constans.SIGNED_URL_EXPIRED_ERROR_MESSAGE);
    });

