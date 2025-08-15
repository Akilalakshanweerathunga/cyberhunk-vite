from django.http import JsonResponse
from .services import (
    analyze_text,
    is_respectful,
    mentions_location,
    discloses_personal_info,
    is_toxic,
    is_potential_misinformation,
)
import requests
import logging

logger = logging.getLogger(__name__)

def fetch_all_comments(post_id, token):
    """Fetch all comments for a given post, handling pagination."""
    comments = []
    next_url = f"https://graph.facebook.com/v19.0/{post_id}/comments?fields=message,created_time&limit=50&access_token={token}"
    while next_url:
        try:
            res = requests.get(next_url).json()
            comments.extend(res.get("data", []))
            next_url = res.get("paging", {}).get("next")
        except Exception as e:
            logger.error(f"Failed to fetch comments for post {post_id}: {e}")
            break
    return comments

def analyze_facebook(request):
    token = request.GET.get('token')
    method = request.GET.get('method', 'nltk')

    if not token:
        return JsonResponse({"error": "Token missing"}, status=400)

    # Fetch profile
    profile_url = f"https://graph.facebook.com/v19.0/me?fields=id,name,email,gender,birthday,picture.width(200).height(200),created_time&access_token={token}"
    try:
        profile_response = requests.get(profile_url)
        profile_data = profile_response.json()
    except Exception as e:
        profile_data = {"error": "Failed to fetch profile data", "details": str(e)}

    insights = []
    next_url = f"https://graph.facebook.com/v19.0/me/posts?fields=message,story,status_type,created_time&limit=25&access_token={token}"

    while next_url:
        try:
            res = requests.get(next_url).json()
            posts = res.get("data", [])

            for post in posts:
                content = post.get("message") or post.get("story") or ""
                if not content.strip() and post.get("status_type") == "shared_story":
                    content = "Shared content (no text)"

                try:
                    analysis = analyze_text(content, method=method)
                except Exception as e:
                    logger.error(f"Failed to analyze post: {content}\nError: {e}")
                    analysis = {
                        "original": content,
                        "translated": "",
                        "label": "neutral",
                        "emojis": [],
                        "emoji_sentiments": []
                    }

                analysis.update({
                    "timestamp": post.get("created_time"),
                    "is_respectful": is_respectful(content),
                    "mentions_location": mentions_location(content),
                    "privacy_disclosure": discloses_personal_info(content),
                    "toxic": is_toxic(content),
                    "misinformation_risk": is_potential_misinformation(content),
                    "status_type": post.get("status_type"),
                    "type": "post"
                })
                insights.append(analysis)

                # Fetch and analyze all comments
                comments = fetch_all_comments(post["id"], token)
                for comment in comments:
                    comment_msg = comment.get("message") or "No text content"
                    try:
                        c_analysis = analyze_text(comment_msg, method=method)
                    except Exception as e:
                        logger.error(f"Failed to analyze comment: {comment_msg}\nError: {e}")
                        c_analysis = {
                            "original": comment_msg,
                            "translated": "",
                            "label": "neutral",
                            "emojis": [],
                            "emoji_sentiments": []
                        }

                    c_analysis.update({
                        "timestamp": comment.get("created_time"),
                        "is_respectful": is_respectful(comment_msg),
                        "mentions_location": mentions_location(comment_msg),
                        "privacy_disclosure": discloses_personal_info(comment_msg),
                        "toxic": is_toxic(comment_msg),
                        "misinformation_risk": is_potential_misinformation(comment_msg),
                        "type": "comment"
                    })
                    insights.append(c_analysis)

            next_url = res.get("paging", {}).get("next")

        except Exception as e:
            logger.error(f"Failed to fetch/process Facebook posts\nError: {e}")
            return JsonResponse({"error": "Failed to fetch or process Facebook data", "details": str(e)}, status=500)

    return JsonResponse({
        "profile": profile_data,
        "insights": insights
    })
