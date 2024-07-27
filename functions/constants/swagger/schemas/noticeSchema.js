const responseNoticeSchema = {
    $status: 200,
    $success: true,
    $message: "공지사항 조회 성공",
    $data: [
        {
            $title: "notice title",
            $url: "notice url",
            $createdAt: "2022-09-15"
        }
    ]
};

module.exports = {
    responseNoticeSchema
}