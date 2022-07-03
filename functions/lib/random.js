const randomString = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    const stringLength = 6;
    let randomString = '';
    for (let i = 0; i < stringLength; i++) {
        const randomNumber = Math.floor(Math.random() * chars.length);
        randomString += chars.substring(randomNumber, randomNumber + 1);
    }
    return randomString;
};

module.exports = {
    randomString,
}