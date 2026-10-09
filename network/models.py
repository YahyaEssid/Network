from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self',
        symmetrical=False,
        related_name = 'followers',
        blank = True
        )

class Post(models.Model):
    content = models.CharField(max_length = 350)
    user = models.ForeignKey(User, on_delete = models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add = True)
    @property
    def likes_count(self):
        return self.reactions.filter(reaction_type="LIKE").count()
    @property
    def dislikes_count(self):
        return self.reactions.filter(reaction_type="DISLIKE").count()
    def serialize(self):
        return{
            "id" : self.id,
            "content" : self.content,
            "username" : self.user.get_username(),
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes_count,
            "dislikes": self.dislikes_count
        }

class Reaction(models.Model):
    REACTION_CHOICES = [
        ('LIKE', 'Like'),
        ('DISLIKE', 'Dislike'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reactions")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="reactions")
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    class Meta:
        unique_together = ('user','post')
