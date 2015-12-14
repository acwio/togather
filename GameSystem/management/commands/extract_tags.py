from django.core.management.base import BaseCommand
from GameSystem.models import *
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    args = ''
    help = 'Used to dump CSV data.'

    def _extract_tags(self):
        print ' :: Dumping CSV Format Data ::'

        games = Game.objects.all()

        for game in games:
            user1 = User.objects.get(id=game.user1)
            user2 = User.objects.get(id=game.user2)

            print " -- Game "+str(game.id)+" --"
            for round in game.rounds.all().order_by('created'):
                print str(round.user1_tags)
            print

            for round in game.rounds.all().order_by('created'):
                print str(round.user2_tags)
            print

        print ' :: Data successfully dumped :: (lol)'

    def handle(self, *args, **options):
        self._extract_tags()