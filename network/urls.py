
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("profile/<str:username>", views.view_profile, name = "profile"),
    path("create", views.createPost, name="create"),
    path("follow/<str:username>", views.follow, name="follow"),
    path("view/<str:feed_type>", views.viewPosts, name="view"),
    path("edit/<str:post_id>", views.editPost, name="edit"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
