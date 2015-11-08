from django.core.management.base import BaseCommand
from GameSystem.models import Subject, AvailableGames
import os

class Command(BaseCommand):
    args = ''
    help = 'Used to populate the subject URLs.'

    def _init_db(self):
        # delete all prior data
        AvailableGames.objects.all().delete()
        Subject.objects.all().delete()

        print 'Creating Papyri Matching Game'
        new_game = AvailableGames.objects.create(name='PapyriMatcher', avatar="assets/img/131011.jpg", game_url="papyri")
        new_game.save()

        # iterate over all the images in the static/assets/img/ directory,
        # create subjects for them, and add them to the papyri matcher available game.
        for image_file in os.listdir(os.getcwd()+"/GameSystem/static/assets/img"):
            new_subj = Subject.objects.create(url="assets/img/"+str(image_file))
            new_game.subjects.add(new_subj)

        # do one final save, just in case
        new_game.save()


        print 'Subject URLs have been added successfully!'

    def handle(self, *args, **options):
        self._init_db()