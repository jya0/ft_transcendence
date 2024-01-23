@api_view(['get'])
def auth(request):
    if request.user.is_authenticated:
        return JsonResponse({'message': 'Already logged in'}, status=200)
    code = request.GET.get("code")
    if code:
        print("code", code)
        data = {
            "grant_type": "authorization_code",
            "client_id": os.environ.get("FORTY_TWO_CLIENT_ID"),
            "client_secret": os.environ.get("FORTY_TWO_CLIENT_SECRET"),
            "code": code,
            "redirect_uri": os.environ.get("FORTY_TWO_REDIRECT_URI"),
        }
        auth_response = requests.post(
            "https://api.intra.42.fr/oauth/token", data=data)
        try:
            access_token = auth_response.json().get("access_token")
        except:
            return JsonResponse({'message': 'Invalid authorization code'}, status=400)
        user_response = requests.get(
            "https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
        try:
            username = user_response.json()["login"]
            email = user_response.json()["email"]
            display_name = user_response.json()["displayname"]
            nickname = display_name
            picture = user_response.json()["image"]
        except:
            response = JsonResponse(
                {'message': 'Failed to fetch user data in main'}, status=200)
            return response
            return HttpResponseRedirect("https://localhost:8090/")
        if username:
            if not UserProfile.objects.filter(username=username).exists():
                try:
                    user_profile = UserProfile.objects.create(
                        username=username,
                        email=email,
                        first_name=display_name.split()[0],
                        last_name=display_name.split()[1],
                        display_name=display_name,
                        nickname=nickname,
                        intra=email.split('@')[0],
                        picture=picture,
                        date_joined=datetime.now())
                    user_profile.set_password(username)
                    user_profile.save()
                except IntegrityError:
                    return JsonResponse({'message': 'This email is already in use. Please choose a different one.'}, status=200)
            else:
                user_profile = UserProfile.objects.get(username=username)

            if user_profile.is_2fa_enabled:
                request.session['username'] = username
                send_otp(request)
                print("sent otp.....")
                access_token = get_user_token(request, username, username)
                return JsonResponse({'otp': 'validate_otp'}, status=200)
                response = HttpResponseRedirect(
                    f"https://localhost:8090/desktop?otp=validate_otp&token={access_token}&username={username}")
                return response

            auth_login(request, user_profile)
            access_token = get_user_token(request, username, username)
            print("---------> token", access_token)
            print(
                f"https://localhost:8090/desktop?token={access_token}&user={username}")
            user_data = {
                'username': user_profile.username,
                'email': user_profile.email,
                'display_name': user_profile.display_name,
                'nickname': user_profile.nickname,
            }
            session_id = request.session.session_key
            return JsonResponse({'token': access_token, 'user': user_data, 'csrfToken': get_token(request=request), 'sessionId': session_id}, status=200)
            response = HttpResponseRedirect(
                f"https://localhost:8090/desktop?token={access_token}&user={username}")
            return response

        response = JsonResponse(
            {'message': 'Failed to fetch user data'}, status=400)
        return response
        return HttpResponseRedirect("https://localhost:8090/")
    else:
        response = JsonResponse({'message': 'Invalid code'}, status=400)
        return response
        return HttpResponseRedirect("https://localhost:8090/")






# 42 env
FORTY_TWO_CLIENT_ID="u-s4t2ud-69155ca3ecf1f57fa6e8660a9988bbdd7f03a45128ea80a454d6f13939c4bca5"
FORTY_TWO_CLIENT_SECRET="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"
FORTY_TWO_REDIRECT_URI="https://localhost:8090/"
FORTY_TWO_URL=https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-69155ca3ecf1f57fa6e8660a9988bbdd7f03a45128ea80a454d6f13939c4bca5&redirect_uri=https%3A%2F%2Flocalhost%3A8090%2F&response_type=code

