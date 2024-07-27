const internalServerErrorSchema = {
    $status: 500,
    $success: false,
    $message: "서버 내부 오류",
};

module.exports = {
    internalServerErrorSchema
}