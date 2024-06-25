const getCommunityReportMessage = (userId, postId, title, postUserId) => `
    {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🚨 게시글 신고 알림 🚨",
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*신고 유저 ID*: ${userId} \n *신고 게시글 ID: ${postId} * \n *게시글 제목:* ${title} \n *게시글 작성자 ID*: ${postUserId}"
                    }
                ]
            }
        ]
    }
`;

module.exports = { getCommunityReportMessage };
