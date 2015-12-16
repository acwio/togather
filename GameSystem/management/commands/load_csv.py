from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from GameSystem.models import *
import csv
import os

####### CSV MUST HAVE THE FOLLOWING HEADERS ######
# person1
# person2
# user1_subjects
# user2_subjects
# user1_tags
# user2_tags

class Command(BaseCommand):
    args = ''
    help = 'Loads data from a CSV file into the db'

    def _load_csv(self):
        u1_exp = 1
        u2_exp = 1
        u1_subjects = ""
        u2_subjects = ""
        u1_id = -1
        u2_id = -1
        rounds = []
        created = 0
        with open('experts.csv', 'rU') as f:
            reader = csv.DictReader(f, delimiter=',')
            for row in reader:
                if (created == 0):
                    # Create the users
                    if not User.objects.filter(username=row['person1']).exists():
                        user1 = User.objects.create_user(username=row['person1'], email='burr@ismyBFF.com', password=row['person1'])
                    else:
                        user1 = User.objects.get(username=row['person1'])

                    if not User.objects.filter(username=row['person2']).exists():
                        user2 = User.objects.create_user(username=row['person2'], email='burr@ismyBFF.com', password=row['person2'])
                    else:
                        user2 = User.objects.get(username=row['person2'])

                    u1_id = user1.id
                    u2_id = user2.id
                    # Create the players
                    player1, created = Player.objects.get_or_create(user=user1,expert=u1_exp)
                    player2, created = Player.objects.get_or_create(user=user2,expert=u2_exp)
                    created = 1

                # Get the current subjects
                u1_sub = str(row['user1_subjects'])
                u2_sub = str(row['user2_subjects'])
                # Append subjects to subject string (for game)
                u1_subjects = str(u1_subjects) + u1_sub + ","
                u2_subjects = str(u2_subjects) + u2_sub + ","

                # Create the round
                round = RoundResponses.objects.create(user1_subject=u1_sub,
                                                      user2_subject=u2_sub,
                                                      user1_tags=str(row['user1_tags']),
                                                      user2_tags=str(row['user2_tags']))

                rounds.append(round)

        game = Game.objects.create(user1=u1_id,
                                   user2=u2_id,
                                   user1_subjects=u1_subjects[:-1],
                                   user2_subjects=u2_subjects[:-1],
                                   round_index=11,
                                   complete=1)

        game.save()

        for index in range(0,len(rounds)):
            game.rounds.add(rounds[index])

        game.save()


    def handle(self, *args, **options):
        self._load_csv()