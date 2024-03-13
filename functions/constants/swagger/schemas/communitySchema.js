const responseCommunityCategorySchema = {
    $status: 200,
    $success: true,
    $message: "커뮤니티 카테고리 조회 성공",
    $data: [
        {
            $id: 1,
            $name: "UI/UX"
        },
    ]
};

const responseCommunityPostsDetailSchema = {
    $status: 200,
    $success: true,
    $message: "커뮤니티 게시글 상세 조회 성공",
    $data: {
        $id: 1,
        $nickname: "잡채",
        $profileImage: "https://s3~",
        $title: "제목",
        $body: "본문",
        $contentUrl: "https://naver.com",
        $contentTitle: "콘텐츠 링크 제목",
        $contentDescription: "콘텐츠 링크 설명",
        $thumbnailUrl: "https://content-thumbnail-image-url",
        $createdAt: "2024-02-01",
    },
}

module.exports = {
    responseCommunityCategorySchema,
    responseCommunityPostsDetailSchema,
};