module.exports = {
  NULL_VALUE: '필요한 값이 없습니다',
  OUT_OF_VALUE: '파라미터 값이 잘못되었습니다',
  FORBIDDEN: '허용되지 않은 접근입니다.',

  // 인증
  SIGNIN_SUCCESS: '소셜 로그인 성공',
  SIGNUP_SUCCESS: '회원 가입 성공',
  DELETE_USER: '회원 탈퇴 성공',
  ALREADY_EMAIL: '이미 사용중인 이메일입니다.',
  NO_USER: '존재하지 않는 회원입니다.',
  INVALID_EMAIL: '잘못된 이메일입니다.',
  TOKEN_EXPIRED: '토큰이 만료되었습니다.',
  TOKEN_INVALID: '토큰이 유효하지 않습니다.',
  TOKEN_EMPTY: '토큰이 없습니다.',
  TOKEN_REISSUE_SUCCESS: '토큰 재발급 성공',

  // 유저
  READ_ONE_USER_SUCCESS: '유저 조회 성공',
  UPDATE_USER_NICKNAME_SUCCESS: '유저 수정 성공',
  READ_PROFILE_SUCCESS: '프로필 조회 성공',

  // 콘텐츠
  ADD_ONE_CONTENT_SUCCESS: '콘텐츠 생성 성공',
  TOGGLE_CONTENT_SUCCESS: '콘텐츠 조회 여부 토글 성공',
  READ_ALL_CONTENT_SUCCESS: '전체 콘텐츠 조회 성공',
  KEYWORD_SEARCH_CONTENT_SUCCESS: '전체 콘텐츠 키워드 검색 성공',
  KEYWORD_SEARCH_CATEGORY_CONTENT_SUCCESS: '카테고리 별 콘텐츠 키워드 검색 성공',
  READ_RECENT_SAVED_CONTENT_SUCCESS: '최근 저장 콘텐츠 조회 성공',
  READ_UNSEEN_CONTENT_SUCCESS: '봐야 하는 콘텐츠 조회 성공',
  DELETE_CONTENT_SUCCESS: '콘텐츠 삭제 성공',
  NO_CONTENT: '존재하지 않는 콘텐츠',
  RENAME_CONTENT_SUCCESS: '콘텐츠 제목 변경 성공',
  UPDATE_CONTENT_CATEGORY_SUCCESS: '콘텐츠 카테고리 변경 성공',
  UPDATE_CONTENT_NOTIFICATION_SUCCESS: '콘텐츠 알림 변경 성공',
  DELETE_CONTENT_NOTIFICATION_SUCCESS: '콘텐츠 알림 삭제 성공',
  DUPLICATED_CONTENT: '중복된 콘텐츠',
  READ_CONTENT_NOTIFICATION_SUCCESS: '콘텐츠 알림 조회 성공',

  // 카테고리
  ADD_ONE_CATEGORY_SUCCESS: '카테고리 생성 완료',
  READ_CATEGORY_SUCCESS: '카테고리 전체 조회 성공',
  READ_CATEGORY_NAME_SUCCESS: '카테고리 이름 조회 성공',
  READ_CATEGORY_CONTENT_SUCCESS: '카테고리 별 콘텐츠 조회 성공',
  UPDATE_ONE_CATEGORY_SUCCESS: '카테고리 수정 성공',
  DELETE_ONE_CATEGORY_SUCCESS: '카테고리 삭제 성공',
  NO_CATEGORY: '존재하지 않는 카테고리',
  UPDATE_CATEGORY_ORDER_SUCCESS: '카테고리 순서 변경 성공',
  DUPLICATED_CATEGORY: '중복된 카테고리',
  READ_CONTENT_CATEGORY_SUCCESS: '콘텐츠 소속 카테고리 조회 성공',

  // 추천 사이트
  READ_ALL_RECOMMENDATION_SUCCESS: '추천 사이트 조회 성공',

  // 서버 내 오류
  INTERNAL_SERVER_ERROR: '서버 내 오류',

  // 푸시 서버
  UPDATE_FCM_TOKEN_SUCCESS: 'fcm 토큰 수정 성공',
  PUSH_SERVER_ERROR: '푸시 서버 내 오류',

  // 공지사항
  READ_NOTICES_SUCCESS: '공지사항 조회 성공',

  // 커뮤니티
  READ_COMMUNITY_POST_SUCCESS: '커뮤니티 게시글 상세 조회 성공',
  READ_COMMUNITY_POSTS_SUCCESS: '커뮤니티 게시글 전체 조회 성공',
  NO_COMMUNITY_POST: '존재하지 않는 커뮤니티 게시글',
  ADD_COMMUNITY_POST_SUCCESS: '커뮤니티 게시글 작성 성공',
  NO_COMMUNITY_CATEGORY: '존재하지 않는 커뮤니티 카테고리',
  NO_PAGE: '존재하지 않는 페이지',
  READ_COMMUNITY_CATEGORIES_SUCCESS: '커뮤니티 카테고리 조회 성공',
  READ_COMMUNITY_CATEGORY_POSTS_SUCCESS: '커뮤니티 카테고리별 게시글 조회 성공',
  REPORT_COMMUNITY_POST_SUCCESS: '커뮤니티 게시글 신고 성공',

  // 서버 상태 체크
  HEALTH_CHECK_SUCCESS: '서버 상태 정상',
};
