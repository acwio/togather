from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from GameSystem.models import *


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


def load_papyri_session(request):
    '''
    Used to connect two users into a session.
    Serves the game UI to the user.
    UI is automatically served with a loading modal. Connection of another user is handled by JavaScript.
    :param request:
    :return:
    '''
    return render(request, 'papyri_game.html', {})