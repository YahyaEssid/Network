Network
A Twitter-style social network built with Django and JavaScript. Users can post, browse feeds, follow other people, edit their own posts, and like or dislike content.
The UI is a single-page style frontend that talks to JSON APIs, styled with Bootstrap.

-Features
User registration, login, and logout
Create posts (max 350 characters)
All Posts feed
Following feed (posts from people you follow)
User profiles with follower/following counts
Follow / unfollow (you cannot follow yourself)
Edit your own posts
Like and dislike posts (one reaction per user per post; clicking the same reaction again removes it)
Pagination (10 posts per page)
Live updates via fetch without full page reloads
Tech stack
Django
Python
JavaScript (fetch APIs)
HTML / Bootstrap 4
SQLite

How it works
The main page is rendered by Django. After that, JavaScript loads posts, profiles, follows, edits, and reactions through JSON endpoints:

Action	Endpoint
List posts
GET /view/<all|following|username>?page=n
Create post
POST /create
Profile info
GET /profile/<username>
Follow / unfollow
POST /follow/<username>
Edit post
PUT /edit/<post_id>
Like / dislike
PUT /posts/<post_id>/react
Models
User — Django user plus a many-to-many following relationship
Post — content, author, timestamp
Reaction — like or dislike, unique per user and post
