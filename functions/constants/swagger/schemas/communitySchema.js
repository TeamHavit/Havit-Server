const responseCommunityCategorySchema = {
  $status: 200,
  $success: true,
  $message: '커뮤니티 카테고리 조회 성공',
  $data: [
    {
      $id: 1,
      $name: 'UI/UX',
    },
  ],
};

const responseCommunityPostsDetailSchema = {
  $status: 200,
  $success: true,
  $message: '커뮤니티 게시글 상세 조회 성공',
  $data: {
    $id: 1,
    $nickname: '잡채',
    $profileImage: 'https://s3~',
    $title: '제목',
    $body: '본문',
    $contentUrl: 'https://naver.com',
    $contentTitle: '콘텐츠 링크 제목',
    $contentDescription: '콘텐츠 링크 설명',
    $thumbnailUrl: 'https://content-thumbnail-image-url',
    $createdAt: '2024-02-01',
  },
};

const responseCommunityPostsListSchema = {
  $status: 200,
  $success: true,
  $message: '커뮤니티 게시글 전체 조회 성공',
  $data: [
    {
      $id: 1,
      $nickname: '잡채',
      $profileImage: 'https://s3~',
      $title: '제목1',
      $body: '본문1',
      $contentUrl: 'https://naver.com',
      $contentTitle: '콘텐츠 링크 제목1',
      $contentDescription: '콘텐츠 링크 설명1',
      $thumbnailUrl: 'https://content-thumbnail-image-url1',
      $createdAt: '2024-02-01',
    },
    {
      $id: 2,
      $nickname: '필립',
      $profileImage: 'https://s3~',
      $title: '제목2',
      $body: '본문2',
      $contentUrl: 'https://example2.com',
      $contentTitle: '콘텐츠 링크 제목2',
      $contentDescription: '콘텐츠 링크 설명2',
      $thumbnailUrl: 'https://content-thumbnail-image-url2',
      $createdAt: '2024-02-02',
    },
    {
      $id: 3,
      $nickname: '윱최',
      $profileImage: 'https://s3~',
      $title: '제목3',
      $body: '본문3',
      $contentUrl: 'https://example3.com',
      $contentTitle: '콘텐츠 링크 제목3',
      $contentDescription: '콘텐츠 링크 설명3',
      $thumbnailUrl: 'https://content-thumbnail-image-url3',
      $createdAt: '2024-02-03',
    },
  ],
};

module.exports = {
  responseCommunityCategorySchema,
  responseCommunityPostsDetailSchema,
  responseCommunityPostsListSchema,
};
