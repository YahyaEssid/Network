import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from network.models import *
from django.contrib.auth.decorators import login_required

from .models import User


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def createPost(request) :
    if request.method != "POST":
        return JsonResponse({"error" : "POST request required."}, status = 400)
    data = json.loads(request.body)#convert request.body from a json string to a python dictionairy
    content = data.get("content", "").strip()
    if not content:
        return JsonResponse({"message": "Post can't be empty"}, status=  400 );
    
    post = Post(content = content, user = request.user)
    post.save()
    return JsonResponse({"message": "Post is created successfully."}, status=201)



def viewPosts(request, feed_type):
    if request.method != "GET":
        return JsonResponse({"error": "GET Request required."}, status=400)
    if feed_type == "all":
        posts= Post.objects.all().order_by("-timestamp")
    elif feed_type == "following":
        posts = Post.objects.filter(user__in = request.user.following.all())
    else :
        posts = Post.objects.filter(user__username=feed_type).order_by("-timestamp")
    return JsonResponse([post.serialize() for post in posts], safe=False)

@login_required
def viewProfile(request, username):
    if request.method != "GET":
        return JsonResponse({"error": "GET Request required."}, status=400)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    following = user.following.count()
    followers = user.followers.count()
    return JsonResponse({"followers" : followers, "following" : following })

@csrf_exempt
@login_required
def follow(request, username):
    if request.method != "PUT":
        JsonResponse("error : PUT request required")
    else :
        pass
        