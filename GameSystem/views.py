from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from GameSystem.models import *
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


def load_game_session(request, availablegame_id):
    '''
    Should be called once two users have been connected into a game.
    Serves the game UI to the user.
    UI is automatically served with a loading modal. Connection of another user is handled by JavaScript.
    :param request:
    :return:
    '''

    # get the available game with the id
    game = AvailableGames.objects.get(id=availablegame_id)

    # get pre-existing game with this user


    # 1. Create a list of subjects for each user with some percentage of identity.
    #   e.g.    user1: [4, 5, 3, 10, 15, 1, 9, 8, 2, 11]
    #           user2: [3, 5, 4, 1, 9, 11, 2, 8, 10, 15]
    # 2. Serve the subject id at the relevant index.

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


    # TODO: (in the form submit view)
    # 1. Increment the game's index
    # 2. Save the tags.

    return render(request, 'game_interface.html', {'game': game})
