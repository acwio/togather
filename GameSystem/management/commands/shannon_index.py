from django.core.management.base import BaseCommand
from GameSystem.models import *
import os
from collections import Counter
from django.db.models import Q
from django.contrib.auth.models import User
import math
from decimal import Decimal

class Command(BaseCommand):
    args = ''

    def _shannon_index(self):
        all_labels = []
        # all_labels = RoundResponses.objects.filter(~Q(result=-1)).values_list('user1_tags', flat=True)
        #more_labels = RoundResponses.objects.filter(~Q(result=-1)).values_list('user2_tags', flat=True)
        all_rounds = RoundResponses.objects.filter(~Q(result=-1))

    mixed_word_count = {}
    nonexpert_word_count = {}
    expert_word_count = {}
    word_count = {}
    games = Game.objects.filter(complete=1)

    for game in games:
        user1 = game.user1
        user2 = game.user2

        # get the user expertise
        user_1 = User.objects.get(id=user1)
        user_2 = User.objects.get(id=user2)

        # get the players
        p1 = Player.objects.get(user=user_1)
        p2 = Player.objects.get(user=user_2)

        isExpert = 0
        isNonExpert = 0
        isMixed = 0

        if p1.expert == 1 and p2.expert == 1:
            isExpert = 1
        elif p1.expert == 0 and p2.expert == 0:
            isNonExpert = 1
        else:
            isMixed = 1


        idx = 0
        for round in game.rounds.all():
            user1_labels = round.user1_tags
            user2_labels = round.user2_tags

            # get user expertise


            spl = user1_labels.split(",")
            for i in spl:
                if not str(i) in word_count:
                    if isExpert:
                        expert_word_count[str(i)] = 1
                    elif isNonExpert:
                        nonexpert_word_count[str(i)] = 1
                    else:
                        mixed_word_count[str(i)] = 1
                else:
                    if isExpert:
                        expert_word_count[str(i)] += 1
                    elif isNonExpert:
                        nonexpert_word_count[str(i)] += 1
                    else:
                        mixed_word_count[str(i)] += 1


            spl = user2_labels.split(",")
            for i in spl:
                if not str(i) in word_count:
                    if isExpert:
                        expert_word_count[str(i)] = 1
                    elif isNonExpert:
                        nonexpert_word_count[str(i)] = 1
                    else:
                        mixed_word_count[str(i)] = 1
                else:
                    if isExpert:
                        expert_word_count[str(i)] += 1
                    elif isNonExpert:
                        nonexpert_word_count[str(i)] += 1
                    else:
                        mixed_word_count[str(i)] += 1



    print "SHAN EXP:"
    print
    for i in expert_word_count.keys():
        print i+" -> "+ expert_word_count[i]
    print
    print str(expert_word_count.values())
    print
    print "SHAN NON:"
    print
    for i in nonexpert_word_count.keys():
        print i+" -> "+ nonexpert_word_count[i]
    print
    print str(nonexpert_word_count.values())
    print
    print "SHAN MIXED:"
    print
    for i in mixed_word_count.keys():
        print i+" -> "+ mixed_word_count[i]
    print
    print str(mixed_word_count.values())

    def handle(self, *args, **options):
        self._shannon_index()
