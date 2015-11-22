from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from GameSystem.models import *
from django.db.models import Q
import random


def home(request):
    '''
    Two Scenarios:
    User is anonymous: Serves login form.
    User is logged in: Serves the homepage of our application.
    :param request:
    :return:
    '''
    if request.user.is_authenticated():
        # get a list of available games
        games = AvailableGames.objects.all()

        return render(request, 'lobby.html', {'available_games': games})
    else:
        return render(request, 'login.html', {})


def get_user(request):
    '''
    Logs in the user. Creates user if the username doesn't exist already.
    :param request:
    :return:
    '''
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        # if the username doesnt exist already, make it
        if not User.objects.filter(username=username).exists():
            user = User.objects.create_user(username=username,
                                            email='burr@ismyBFF.com',
                                            password=password)

        # authenticate and login the user programmatically
        user = authenticate(username=request.POST['username'],
                            password=request.POST['password'])
        login(request, user)

    # redirect to the homepage for both types of requests
    return HttpResponseRedirect('/')


def load_game_session(request, gametype_id):
    '''
    Should be called once two users have been connected into a game.
    Serves the game UI to the user.
    UI is automatically served with a loading modal. Connection of another user is handled by JavaScript.
    :param request:
    :return:
    '''

    # get the available game with the id
    game_type = AvailableGames.objects.get(id=gametype_id)

    # get pre-existing game with this user
    games = Game.objects.filter(Q(user1=request.user.id) | Q(user2=request.user.id))

    # create the game if necessary
    if len(games) == 0:   # User is not currently in a game
        # look at the player queue
        pq = PlayerQueue.objects.all()

        if len(pq) == 0: # if the player queue is empty, create a new game instance
            # Create a list of subjects for each user with some percentage of identity
            NUM_CLIPS = 20
            NUM_ROUNDS = 10
            NUM_SAME = 4

            clips = range(1, NUM_CLIPS)
            user1 = random.sample(range(1, NUM_CLIPS), 10)
            user2 = random.sample(range(1, NUM_CLIPS), 10)

            # Generate two list where user1[index] != user2[index]
            for index in range(len(user2)):
                if (user1[index] == user2[index]):
                    # Figure out what song we can replace in user2
                    # so they do not listen to the same song twice
                    canAdd = list(set(clips) - set(user2))
                    # Grab a random song from this list
                    replace = random.choice(canAdd)
                    # Replace it in the user2
                    user2[index] = replace


            # Create a list of random indexes (determining where
            # to serve the same clips to both)
            sameIndex = random.sample(range(0, NUM_ROUNDS-1), NUM_SAME)

            for index in range(len(sameIndex)):
                item1 = user1[sameIndex[index]]
                item2 = user2[sameIndex[index]]
                if item1 not in user2:
                    user2[sameIndex[index]] = item1
                elif item2 not in user1:
                    user1[sameIndex[index]] = item2
                else:
                    # Generate a single list of random IDs not currently
                    # in both lists
                    randomID = list(set(clips) - set(user1) - set(user2))
                    item = random.choice(randomID)
                    user1[sameIndex[index]] = item
                    user2[sameIndex[index]] = item

            # convert the lists
            user1 = ','.join(map(str, user1))
            user2 = ','.join(map(str, user2))

            # Create the Game instance
            game = Game.objects.create(user1=request.user.id,
                                           user1_subjects=user1,
                                           user2_subjects=user2)
            game.save()

            # Add the user to the PlayerQueue
            new_player = PlayerQueue.objects.create(user_id=request.user.id, api_key="")
            new_player.save()

            # Serve the first subject to the user
            subject_id = int(user1.split(",")[0])+159
            subject = Subject.objects.get(id=subject_id)


        else: # Player Queue isn't empty; Find the game with the player in the queue and add this user to the game.
            # get the first player in the queue
            existing_player = pq[0]

            # get the game the existing player belongs to
            game = Game.objects.filter(Q(user1=existing_player.user_id) | Q(user2=existing_player.user_id))[0]

            # add the requesting user to the game as player 2
            game.user2 = request.user.id
            game.save()

            # serve the first subject in the user2_subjects to the user
            subject_id = int(game.user2_subjects.split(",")[0])+159
            subject = Subject.objects.get(id=subject_id)


    elif len(games) == 1:   # User is currently in a game.

        # get the user's game
        game = games[0]

                # check if they're user 1 or 2
        subject_set = ''
        if game.user1 == request.user.id:
            subject_set = game.user1_subjects
        elif game.user2 == request.user.id:
            subject_set = game.user2_subjects

        # get the subject at the round index.
        round_index = int(game.round_index)
        subject_id = int(subject_set.split(",")[round_index])+159
        print subject_id
        subject = Subject.objects.get(id=subject_id)


    # TODO: (in the form submit view)
    # 1. Increment the game's index
    # 2. Save the tags.

    return render(request, 'game_interface.html', {'game_type': game_type, 'game': game, 'subject': subject})
