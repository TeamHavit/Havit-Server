const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getUser = async (client, userId) => {
    const { rows } = await client.query(
        `
        SELECT * FROM "user"
        WHERE id = $1
        `,
        [userId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getUserByFirebaseId = async (client, firebaseUserId) => {
    const { rows } = await client.query(
        `
        SELECT * FROM "user"
        WHERE id_firebase = $1
        `,
        [firebaseUserId]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const addUser = async (client, firebaseUserId, nickname, email, age, gender) => {
    const { rows } = await client.query(
        `
        INSERT INTO "user"
        (id_firebase, nickname, email, age, gender)
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [firebaseUserId, nickname, email, age, gender]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateUserByLogin = async (client, firebaseUserId, nickname, email) => {
    const { rows } = await client.query(
        `
        UPDATE "user"
        SET nickname = $2, email = $3
        WHERE id_firebase = $1
        RETURNING *
        `,
        [firebaseUserId, nickname, email]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateRefreshToken = async (client, userId, newRefreshToken) => {
    const { rows } = await client.query(
        `
        UPDATE "user"
        SET refresh_token = $2
        WHERE id = $1
        `,
        [userId, newRefreshToken]
    );
};

const updateNickname = async (client, userId, newNickname) => {
    const { rows } = await client.query(
        `
        UPDATE "user"
        SET nickname = $2, edited_at = now()
        WHERE id = $1
        `,
        [userId, newNickname]
    );
};

module.exports = { getUser, getUserByFirebaseId, addUser, updateUserByLogin, updateRefreshToken, updateNickname };