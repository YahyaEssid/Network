import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from network.models import *
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator

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
        posts = Post.objects.filter(user__in = request.user.following.all()).order_by("-timestamp")
    else :
        posts = Post.objects.filter(user__username=feed_type).order_by("-timestamp")
    p = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = p.get_page(page_number)
    return JsonResponse({
        "posts": [post.serialize() for post in page_obj],
        "has_next": page_obj.has_next(),
        "has_previous": page_obj.has_previous(),
        "page_number": page_obj.number,
        "num_pages": p.num_pages
    })

@login_required
def view_profile(request, username):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=405)

    target_user = get_object_or_404(User, username=username)

    # Check if logged-in user follows target user
    is_following = request.user.following.filter(username=username).exists()

    return JsonResponse({
        "username": target_user.username,
        "following": target_user.following.count(),
        "followers": target_user.followers.count(),
        "is_following": is_following,
        "is_self": request.user == target_user  # Helper to hide button on own profile
    })

@csrf_exempt
@login_required
def follow(request, username):
        if request.method != "POST":
            return JsonResponse({"error": "POST request required."}, status=405)
        target_user = get_object_or_404(User, username=username)
        if target_user == request.user:
            return JsonResponse({"error": "You cannot follow yourself."}, status=400)
        if request.user.following.filter(username=username).exists():
            request.user.following.remove(target_user)
            is_following = False
        else:
            request.user.following.add(target_user)
            is_following = True
        return JsonResponse({
        "is_following": is_following,
        "followers_count": target_user.followers.count()
    })


@csrf_exempt
@login_required
def editPost(request, post_id):
    if (request.method != "PUT"):
        return JsonResponse({"error": "PUT request required."}, status=405)
    post = get_object_or_404(Post, pk=post_id)
    if (post.user != request.user):
        return JsonResponse({"error":"Forbiden action: User isn't owner of post"}, status= 403)
    new_content = json.loads(request.body).get("content")
    post.content = new_content
    post.save()
    return JsonResponse({"message": "Post is edited successfully."})


@csrf_exempt
@login_required
def react(request, post_id):
    if request.method != "PUT":
        return JsonResponse("error: PURrequest required")
    post = get_object_or_404(Post, pk=post_id)
    new_reaction_type = json.loads(request.body).get("reaction")
    existing_reaction = Reaction.objects.filter(user=request.user, post=post).first()
    if existing_reaction:
        if existing_reaction.reaction_type == new_reaction_type:
            existing_reaction.delete()
            message = "Reaction removed"
        else:
            existing_reaction.reaction_type = new_reaction_type
            existing_reaction.save()
            message = f"Reaction changed to {new_reaction_type}"
    else:
        Reaction.objects.create(
            user=request.user,
            post=post,
            reaction_type=new_reaction_type
        )
        message = f"Post {new_reaction_type.lower()}d successfully"
    likes_count = Reaction.objects.filter(post=post, reaction_type="LIKE").count()
    dislikes_count = Reaction.objects.filter(post=post, reaction_type="DISLIKE").count()
    return JsonResponse({
        "message": message,
        "likes_count": likes_count,
        "dislikes_count": dislikes_count
    }, status=200)