# channels version of django views
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from login.models import UserProfile, Match, Tournament
from django.db.models import Q
from datetime import date

def create_new_game_lobby(game):
    dummy = Tournament.objects.all()[0]
    Match.objects.create(tournament_id_id=dummy.tournament_id, id1_id=2,
                         id2_id=3, score1=0, score2=0, ongoing=False, type=game, time = date.today())


def prepare_final_round(tourn, user):
    game = Match.objects.filter(
        Q(tournament_id_id=tourn.tournament_id) & (Q(id1_id=user) | Q(id2_id=user)))
    print("--------------------------------------------------------------------------------")
    print("--------------------------------------------------------------------------------")
    print("--------------------------------------------------------------------------------")
    print(game.__dict__)
    print("--------------------------------------------------------------------------------")
    print("--------------------------------------------------------------------------------")
    print("--------------------------------------------------------------------------------")
    
    if (not game):
        print("creating a final round now...")
        print(game.__dict__)
        game = Match.objects.create(
            tournament_id_id=tourn.tournament_id, id1_id=user, id2_id=3, score1=0, score2=0, ongoing=False, open_lobby=True,time = date.today())
        game.save()
        return False
    game = game[0]
    game = Match.objects.get(match_id=game.match_id)
    print("getting second player to the final round now...")
    print(game.__dict__)
    game.id2 = user
    game.save()
    print("heres the final round now...")
    print(game)
    return True, game


def remove_from_lobbies(text_data_json):
    sender = text_data_json["sender"]
    open_lobbies = Match.objects.filter(Q(open_lobby=True) & (
        Q(id1__intra=sender) | Q(id2__intra=sender)))

    for game in open_lobbies:
        if game.id1.intra == sender:
            game.id1 = UserProfile.objects.get(intra='temp1')
            print("succesfully removed from a lobby")
        elif game.id2.intra == sender:
            game.id2 = UserProfile.objects.get(intra='temp2')
            print("succesfully removed from a lobby")
        game.save()


class GameConsumer(WebsocketConsumer):

    def connect(self):

        self.room_group_name = 'test'

        # here we create a new group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        print('openng a connection')
        self.accept()

    def kick_out_of_game(self, text_data_json):
        username = text_data_json["sender"]
        ongoing_games = Match.objects.filter(
            (Q(id1__intra=username) | Q(id2__intra=username)) & Q(ongoing=True)
        )

        for game in ongoing_games:
            # Set the winner to the other player
            if game.id1.intra == username:
                game.winner = game.id2.intra
            else:
                game.winner = game.id1.intra
            game.ongoing = False
            game.save()

            #If the game is part of a tournament, prepare for the final round
            if text_data_json['mode'] == 'tournament':
                tourn = Tournament.objects.get(tournament_id=game.tournament_id_id)
                player = UserProfile.objects.get(intra=username)
                prepare_final_round(tourn, player)

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'terminate',
                    'game': text_data_json['game'],
                    'mode': text_data_json['mode'],
                    'sender': text_data_json['sender'],
                    'player1': game.id1.intra,
                    'player2': game.id2.intra,
                }
            )

    def tic_recv(self, text_data_json):

        type = text_data_json['type']
        mode = text_data_json['mode']
        username = text_data_json['username']
        choice = text_data_json['game']
        # handle in-game player movements
        if (type == 'update'):
            key = text_data_json['key']
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'game': 'tic',
                    'mode': mode,
                    'sender': username,
                    'player1': text_data_json['player1'],
                    'player2': text_data_json['player2'],
                    'key': key
                }
            )
        else:
            # handle new game request:
            if (type == 'start'):
                status = 'waiting'
                dummy = Tournament.objects.all()[0]
                open_lobby = Match.objects.filter(Q(open_lobby=True) & Q(
                    tournament_id_id=dummy) & Q(type='tic')).exists()
                print(open_lobby)
                game = Match.objects.filter(Q(open_lobby=True) & Q(
                    tournament_id_id=dummy) & Q(type='tic'))
                if (not game):
                    create_new_game_lobby('tic')
                else:
                    game = game[0]
                player = UserProfile.objects.filter(Q(intra=username)).all()[0]
                if (open_lobby == True):
                    # case 1: no players yet
                    if (game.id1.intra == 'temp1'):
                        print("looks like ur the first player!!!!")
                        # self.room_group_name = username
                        game.id1 = player
                    # case 2: lobby half full
                    else:
                        if (game.id1 != player):
                            print("we found u a match!!!!!!!")
                            # self.room_group_name = game.id1.intra
                            game.id2 = player
                            status = 'start'
                            game.open_lobby = False
                            game.ongoing = True
                            create_new_game_lobby('tic')
                    game.save()
                    # @todo:
                    # if game full, create a new one now:

                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'start_game',
                        'game': 'tic',
                        'mode': mode,
                        'sender': username,
                        'status': status,
                        'player1': game.id1.intra,
                        'player2': game.id2.intra,
                    }
                )

            # handle game ends
            if (type == 'end'):
                current_game = Match.objects.filter((Q(id1__intra=username) | Q(
                    id2__intra=username)) & Q(ongoing=True) & Q(type='tic'))[0]
                player = UserProfile.objects.filter(Q(intra=username))[0]
                current_game.winner = text_data_json['winner']
                current_game.ongoing = False
                current_game.time = date.today()
                if (current_game.id1.intra == current_game.winner):
                    current_game.score1 = 1
                    current_game.score2 = 0
                else :
                    current_game.score1 = 0 
                    current_game.score2 = 1
                current_game.save()
                self.close()

    def receive(self, text_data):

        text_data_json = json.loads(text_data)
        print('receieved from client: ', text_data_json)
        type = text_data_json['type']

        if (type == 'terminate'):
            remove_from_lobbies(text_data_json)
            self.kick_out_of_game(text_data_json)
            self.disconnect(1000)
            return

        mode = text_data_json['mode']
        username = text_data_json['username']
        choice = text_data_json['game']
        if (choice == 'tic'):
            self.tic_recv(text_data_json)
            return

        # handle in-game player movements
        if (type == 'update'):
            key = text_data_json["key"]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'game': 'pong',
                    'mode': mode,
                    'sender': username,
                    'player1': text_data_json['player1'],
                    'player2': text_data_json['player2'],
                    'key': key,
                }
            )

        if (mode == 'tournament'):
            print(text_data_json)
            t_name = text_data_json['tournament_name']
            # handle new game request:
            if (type == 'start' and text_data_json['round'] != 'final'):
                status = 'waiting'
                lobbyFull = False
                tourn = Tournament.objects.get(name=t_name)
                games = Match.objects.filter(
                    Q(tournament_id=tourn.tournament_id))
                player = UserProfile.objects.get(intra=username)
                game = games[0]
                if (game.id1.intra == 'temp1'):
                    game.id1 = player
                elif (game.id2.intra == 'temp2'):
                    game.id2 = player
                else :
                    game = games[1]
                    if (game.id1.intra == 'temp1'):
                        game.id1 = player
                    if (game.id2.intra == 'temp2'):
                        game.id2 = player
                    lobbyFull = True

                    
                if (lobbyFull):
                    status = 'start'
                    print("game 1: " + games[0].id1.intra + games[0].id2.intra)
                    print("game 2: " + games[1].id1.intra + games[1].id2.intra)
                    games[0].open_lobby = False
                    sender = games[0].id2.intra
                    print("sender :" + sender)
                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_name,
                        {
                            'type': 'start_game',
                            'game': 'pong',
                            'mode': mode,
                            'sender': 'server',
                            'player1': games[0].id1.intra,
                            'player2': games[0].id2.intra,
                            'status': status,
                        }
                    )
                    # games[0].ongoing = True
                    # games[1].ongoing = True
                    # games[0].open_lobby = False
                    # games[1].open_lobby = False
                    game = Match.objects.filter(match_id=games[0].match_id).get()
                    game.ongoing = True
                    game.open_lobby = False
                    game.save()
                    game = Match.objects.filter(match_id=games[1].match_id).get()
                    game.ongoing = True
                    game.open_lobby = False
                    game.save()
                    sender = games[1].id2.intra
                    print("sender :" + sender)
                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_name,
                        {
                            'type': 'start_game',
                            'game': 'pong',
                            'mode': mode,
                            'round': 'final',
                            'sender': 'server',
                            'player1': games[1].id1.intra,
                            'player2': games[1].id2.intra,
                            'status': status
                        }
                    )
            

            if (type == 'start' and text_data_json['round'] == 'final'):
                tourn = Tournament.objects.get(name=t_name)
                print("tourn = ")
                print(tourn.__dict__)
                player = UserProfile.objects.get(intra=username)
                print("player = ")
                print(player.__dict__)
                ready, final_game = prepare_final_round(tourn, player)
                # final_game = Match.objects.filter(Q(tournament_id_id=tourn.tournament_id) & Q(open_lobby=True)).get()
                status = 'waiting'
                if (ready):
                    status = 'start'
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'start_game',
                        'game': 'pong',
                        'mode': mode,
                        'sender': username,
                        'status': status,
                        'player1': final_game.id1.intra,
                        'player2': final_game.id2.intra,
                    }
                )


            # handle game ends
            if (type == 'end'):
                print("************************************************")
                print("________________________________________________")
                print("________________________________________________")
                print("________________________________________________")
                print("___________________EENNNDDD_____________________")


                print(text_data_json)
                print("________________________________________________")
                print("________________________________________________")
                print("________________________________________________")
                print("************************************************")

                tourn = Tournament.objects.get(name=t_name)
                player = UserProfile.objects.get(intra=username)
                # print("tourn = " + tourn)
                # print("player = " + player)
                games = Match.objects.filter(Q(tournament_id=tourn.tournament_id) & Q(open_lobby=False))
                if (games[0].id1 == player or games[0].id2 == player):
                    current_game = games[0]
                else:
                    current_game = games[1]
                score1 = text_data_json['score1']
                score2 = text_data_json['score2']
                current_game.ongoing = False
                if (score1 > score2):
                    current_game.winner = current_game.id1.intra
                else:
                    current_game.winner = current_game.id2.intra
                current_game.score1 = score1
                current_game.score2 = score2
                current_game.open_lobby = False
                current_game.time = date.today()
                current_game.save()
                self.close()

        else:
            # handle new game request:
            if (type == 'start'):
                status = 'waiting'
                dummy = Tournament.objects.all()[0]
                open_lobby = Match.objects.filter(
                    Q(open_lobby=True) & Q(tournament_id_id=dummy) & Q(type='pong')).exists()
                print(open_lobby)
                game = Match.objects.filter(Q(open_lobby=True) & Q(tournament_id_id=dummy) & Q(type='pong'))[0]
                print(game)
                player = UserProfile.objects.filter(Q(intra=username)).all()[0]
                if (open_lobby == True):
                    # case 1: no players yet
                    if (game.id1.intra == 'temp1'):
                        print("looks like ur the first player!!!!")
                        # self.room_group_name = username
                        game.id1 = player
                    # case 2: lobby half full
                    else:
                        if (game.id1 != player):
                            print("we found u a match!!!!!!!")
                            # self.room_group_name = game.id1.intra
                            game.id2 = player
                            status = 'start'
                            game.open_lobby = False
                            game.ongoing = True
                            create_new_game_lobby('pong')
                    game.save()
                    # @todo:
                    # if game full, create a new one now:

                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'start_game',
                        'game': 'pong',
                        'mode': mode,
                        'sender': username,
                        'status': status,
                        'player1': game.id1.intra,
                        'player2': game.id2.intra,
                    }
                )

            # handle game ends
            if (type == 'end'):
                current_game = Match.objects.filter(
                    (Q(id1__intra=username) | Q(id2__intra=username)) & Q(ongoing=True))[0]
                player = UserProfile.objects.filter(Q(intra=username))[0]
                score1 = text_data_json['score1']
                score2 = text_data_json['score2']
                current_game.ongoing = False
                if (score1 > score2):
                    current_game.winner = current_game.id1.intra
                else:
                    current_game.winner = current_game.id2.intra
                current_game.score1 = score1
                current_game.score2 = score2
                current_game.time = date.today()
                current_game.save()
                self.close()

    def start_game(self, event):
        message = event['status']
        sender = event['sender']
        mode = event['mode']
        self.send(text_data=json.dumps({
            'type': 'start',
            'game': event['game'],
            'mode': mode,
            'sender': sender,
            'status': message,
            'player1': event['player1'],
            'player2': event['player2'],

        }))

    def update_game(self, event):
        message = event['key']
        sender = event['sender']
        mode = event['mode']
        self.send(text_data=json.dumps({
            'type': 'update',
            'game': event['game'],
            'mode': mode,
            'sender': sender,
            'key': message,
            'player1': event['player1'],
            'player2': event['player2'],
        }))

    def terminate(self, event):
        sender = event['sender']
        mode = event['mode']
        self.send(text_data=json.dumps({
            'type': 'terminate',
            'game': event['game'],
                    'mode': mode,
                    'sender': sender,
                    'player1': event['player1'],
                    'player2': event['player2'],
        }))

    def disconnect(self, code):

        # remmove players from any games with open lobbies
        # sender = self.scope['user'].username
        # self.disconnect_from_games(sender)

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        print('closing socket bruv')
        self.close()
