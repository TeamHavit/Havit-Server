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

const addUser = async (client, firebaseUserId, nickname, email) => {
    const { rows } = await client.query(
        `
        INSERT INTO "user"
        (id_firebase, nickname, email)
        VALUES
        ($1, $2, $3)
        RETURNING *
        `,
        [firebaseUserId, nickname, email]
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { getUser, getUserByFirebaseId, addUser };