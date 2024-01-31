# channels version of django views
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from login.models import UserProfile, Match, Tournament
from django.db.models import Q


def create_new_game_lobby(game):
    dummy = Tournament.objects.all()[0]
    Match.objects.create(tournament_id_id=dummy.tournament_id, id1_id=2,
                         id2_id=3, score1=0, score2=0, ongoing=False, type=game)


def prepare_final_round(tourn, user):
    if (Match.objects.filter(tournament_id_id=tourn.tournament_id).count() == 2):
        game = Match.objects.create(
            tournament_id_id=tourn.tournament_id, id1_id=2, id2_id=5, score1=0, score2=0, ongoing=True)
        game.id1 = user
        game.save()
        return False
    game = Match.objects.filter(
        Q(tournament_id_id=tourn.tournament_id) & (Q(id1_id=2) | Q(id2_id=3)))
    game = Match.objects.get(match_id=game.match_id)
    game.id2 = user
    game.save()
    return True


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
                    'key': key,
                }
            )

        if (mode == 'tournament'):
            print(text_data_json)
            t_name = text_data_json['tournament_name']
            # handle new game request:
            if (type == 'start'):
                status = 'waiting'
                tourn = Tournament.objects.get(name=t_name)
                games = Match.objects.filter(
                    Q(tournament_id=tourn.tournament_id))
                player = UserProfile.objects.get(intra=username)
                lobbyFull = True
                game = games[0]
                if (game.id1.intra == 'temp1' or game.id2.intra == 'temp2'):
                    lobbyFull = False

                if (lobbyFull):
                    status = 'start'
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'start_game',
                        'game': 'pong',
                        'mode': mode,
                        'sender': username,
                        'player1': game.id1.intra,
                        'player2': game.id2.intra,
                        'status': status
                    }
                )

            # handle game ends
            if (type == 'end'):
                tourn = Tournament.objects.get(name=t_name)
                player = UserProfile.objects.get(intra=username)
                games = Match.objects.filter(
                    Q(ongoing=True) & Q(tournament_id=tourn.tournament_id))
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
                current_game.save()

                ready = prepare_final_round(tourn, player)
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
                    }
                )

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
