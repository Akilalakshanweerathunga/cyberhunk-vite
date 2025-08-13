from django.http import JsonResponse
from .services import analyze_text, is_respectful, mentions_location
import requests
import logging

logger = logging.getLogger(__name__)

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
    next_url = f"https://graph.facebook.com/v19.0/me/posts?fields=message,story,status_type,created_time,comments{{message,created_time}}&limit=10&access_token={token}"

    while next_url:
        try:
            res = requests.get(next_url).json()
            posts = res.get("data", [])

            for post in posts:
                # Use message or story; if both missing, fallback to empty string
                content = post.get("message") or post.get("story") or ""
                
                if content.strip():  # Only analyze non-empty content
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

                    analysis["timestamp"] = post.get("created_time")
                    analysis["is_respectful"] = is_respectful(content)
                    analysis["mentions_location"] = mentions_location(content)
                    analysis["status_type"] = post.get("status_type")
                    insights.append(analysis)

                # Analyze comments
                comments = post.get("comments", {}).get("data", [])
                for comment in comments:
                    comment_msg = comment.get("message")
                    if comment_msg and comment_msg.strip():
                        try:
                            analysis = analyze_text(comment_msg, method=method)
                        except Exception as e:
                            logger.error(f"Failed to analyze comment: {comment_msg}\nError: {e}")
                            analysis = {
                                "original": comment_msg,
                                "translated": "",
                                "label": "neutral",
                                "emojis": [],
                                "emoji_sentiments": []
                            }

                        analysis["timestamp"] = comment.get("created_time")
                        analysis["is_respectful"] = is_respectful(comment_msg)
                        analysis["mentions_location"] = mentions_location(comment_msg)
                        insights.append(analysis)

            next_url = res.get("paging", {}).get("next")

        except Exception as e:
            logger.error(f"Failed to fetch/process Facebook posts\nError: {e}")
            return JsonResponse({"error": "Failed to fetch or process Facebook data", "details": str(e)}, status=500)

    return JsonResponse({
        "profile": profile_data,
        "insights": insights
    })
