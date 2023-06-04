import CryptoJS from "crypto-js";

export function encrypt(data) {
    return CryptoJS.AES.encrypt(
        data,
        process.env.REACT_APP_SECRET
    ).toString();
}

export function decrypt(data) {
    return CryptoJS.AES.decrypt(
        data,
        process.env.REACT_APP_SECRET
    ).toString(CryptoJS.enc.Utf8);
}