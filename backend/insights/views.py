from django.http import JsonResponse
from .services import analyze_text, is_respectful, mentions_location
import requests

def analyze_facebook(request):
    token = request.GET.get('token')
    method = request.GET.get('method', 'nltk')

    if not token:
        return JsonResponse({"error": "Token missing"}, status=400)

    profile_url = f"https://graph.facebook.com/v19.0/me?fields=id,name,email,gender,birthday,picture.width(200).height(200),created_time&access_token={token}"
    try:
        profile_response = requests.get(profile_url)
        profile_data = profile_response.json()
    except Exception as e:
        profile_data = {"error": "Failed to fetch profile data", "details": str(e)}

    insights = []
    next_url = f"https://graph.facebook.com/v19.0/me/posts?fields=message,created_time,comments{{message,created_time}}&limit=10&access_token={token}"

    while next_url:
        try:
            res = requests.get(next_url).json()
            posts = res.get("data", [])

            for post in posts:
                if 'message' in post:
                    analysis = analyze_text(post['message'], method=method)
                    analysis["timestamp"] = post.get("created_time")
                    analysis["is_respectful"] = is_respectful(post['message'])
                    analysis["mentions_location"] = mentions_location(post['message'])
                    insights.append(analysis)

                comments = post.get("comments", {}).get("data", [])
                for comment in comments:
                    if 'message' in comment:
                        analysis = analyze_text(comment['message'], method=method)
                        analysis["timestamp"] = comment.get("created_time")
                        analysis["is_respectful"] = is_respectful(comment['message'])
                        analysis["mentions_location"] = mentions_location(comment['message'])
                        insights.append(analysis)

            next_url = res.get("paging", {}).get("next")

        except Exception as e:
            return JsonResponse({"error": "Failed to fetch or process Facebook data", "details": str(e)}, status=500)

    return JsonResponse({
        "profile": profile_data,
        "insights": insights
    })
