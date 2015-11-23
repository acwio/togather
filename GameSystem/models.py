from django.db import models


class RoundResponses(models.Model):
    '''
    The fundamental building block of a game. Each game has 10(?) sessions.
    '''
    result = models.IntegerField(default=-1)  # 0 == loss, 1 == win
    user1_vote = models.IntegerField(default=-1) # 0 == diff, 1 == same
    user2_vote = models.IntegerField(default=-1) # 0 == diff, 1 == same
    user1_subject = models.IntegerField(default=-1)  # id of the subject (image)
    user2_subject = models.IntegerField(default=-1)  # id of the subject (image)
    user1_tags = models.TextField(default="", blank=True)
    user2_tags = models.TextField(default="", blank=True)
    time = models.DecimalField(max_digits=10, decimal_places=2, null=True)


class Game(models.Model):
    '''
    Users play multiple rounds in a game and accumulate a total score.
    '''
    user1 = models.IntegerField(default=-1)
    user2 = models.IntegerField(default=-1)
    user1_subjects = models.TextField(default="", blank=True)
    user2_subjects = models.TextField(default="", blank=True)
    round_index = models.IntegerField(default=1)
    rounds = models.ManyToManyField(RoundResponses)
    score = models.IntegerField(default=0)


class Subject(models.Model):
    '''
    A model for holding image URLs for a specific available game.
    '''
    url = models.TextField(default="", blank=True)
    explicit_id = models.IntegerField(default=-1)
    type = models.TextField(default="", blank=True)


class AvailableGames(models.Model):
    '''
    A list of games that are currently playable. For this course, only the Papyri Matcher game will be playable.
    '''
    name = models.TextField(default="", blank=True)
    game_type = models.TextField(default="", blank=True)
    avatar = models.TextField(default="", blank=True)
    subjects = models.ManyToManyField(Subject)


class PlayerQueue(models.Model):
    '''
    A queue for matching players in a game. Not yet sure what else we need in order to "connect" two people.
    '''
    user_id = models.IntegerField(default=-1)
    api_key = models.TextField(default="", blank=True)