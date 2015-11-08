from django.db import models


class Round(models.Model):
    result = models.IntegerField(default=-1)  # 0 == loss, 1 == win
    subject = models.IntegerField(default=-1)  # id of the subject (image)
    user1_tags = models.TextField(default="", blank=True)
    user2_tags = models.TextField(default="", blank=True)
    time = models.DecimalField(max_digits=10, decimal_places=2)


class Game(models.Model):
    user1 = models.IntegerField(default=-1)
    user2 = models.IntegerField(default=-1)
    rounds = models.ManyToManyField(Round)
    score = models.IntegerField(default=-1)


class Subject(models.Model):
    url = models.TextField(default="", blank=True)


class AvailableGames(models.Model):
    name = models.TextField(default="", blank=True)
    subjects = models.ManyToManyField(Subject)