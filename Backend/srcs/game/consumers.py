#channels version of django views
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from login.models import UserProfile, Match, Tournament
from django.db.models import Q

def create_new_game_lobby():
    dummy = Tournament.objects.all()[0]
    Match.objects.create(tournament_id_id=dummy.tournament_id, id1_id=2, id2_id=3, score1=0, score2=0, ongoing=False)

class ChatConsumer(WebsocketConsumer):
    lobbyCount = 0

    def connect(self):
        
        #@TODO: if already in game - refuse connection

        self.room_group_name = 'test'

        #here we create a new group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        print('sup mfs')
        self.accept()
       
        # self.send(text_data=json.dumps({
        #     'type': 'connection established',
        #     'start' : start
        # }))
        # async_to_sync(self.channel_layer.group_send)(
        #     self.room_group_name,
        #     {
        #         'type': 'start',
        #         'username' : start
        #     }
        # )


    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print('receieved from client: ', text_data_json)
        type = text_data_json['type']
        username = text_data_json['username']

        #handle new game request:
        if (type == 'start'):
            status = 'waiting'
            open_lobby = Match.objects.filter(Q(open_lobby=True)).exists()
            print(open_lobby)
            game =  Match.objects.filter(Q(open_lobby=True))[0]
            player = UserProfile.objects.filter(Q(intra=username))[0]
            if (open_lobby == True):
                #case 1: no players yet
                if (game.id1.intra == 'default'):
                    print("looks like ur the first player!!!!")
                    # self.room_group_name = username
                    game.id1 = player
                #case 2: lobby half full
                else :
                    if (game.id1 != player):
                        print("we found u a match!!!!!!!")
                        # self.room_group_name = game.id1.intra
                        game.id2 = player
                        status = 'start'
                        game.open_lobby = False
                        game.ongoing = True
                        create_new_game_lobby()
                game.save()
                #@todo:
                #if game full, create a new one now:

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'start_game',
                    'sender' : username,
                    'status' : status
                }
            )


        if (type == 'update'):
            key = text_data_json["key"]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'update_game',
                    'sender': username,
                    'key' : key,
                }
            )


        if (type == 'end'):
            current_game = Match.objects.filter((Q(id1__intra=username)|Q(id2__intra=username)) & Q(ongoing=True))[0]
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
        self.send(text_data=json.dumps({
            'type' : 'start',
            'sender' : sender,
            'status' : message
        }))

    def update_game(self, event):
        message = event['key']
        sender = event['sender']
        self.send(text_data=json.dumps({
                    'type' : 'update',
                    'sender': sender,
                    'key' : message
                }))


    def disconnect(self, code):
        # self.send(text_data=json.dumps({
        #     'type': 'close',
        # }))

        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        self.close()
        # is_playing = Match.objects.filter((Q(id1__id='rriyas') | Q(id2__id='rriyas')) & ongoing=True).exists()
        
        # open_games = Match.objects.all().count()
        #Case 1:  match to an open game
        # if (open_games == 0):
        #      Match.objects.create(
        #             tournament_id=-1,
        #             open_lobby=True,
        #             id1=username
        #         )



        # #Case 2: hes not in a game AND hes the first player
        # # in_game = Match.objects.filter((Q(id1__intra=username) | Q(id2__intra=username)) & Q(ongoing=True)).exists()
        # in_game = Match.objects.filter(
        #     (Q(id1__display_name=username) | Q(id2__display_name=username)) & Q(ongoing=True)
        # ).exists()

        # status = 'waiting'
        # if (in_game == False):
            
        #     #look for open games
        #     open_games = Match.objects.filter(Q(open_lobby=True)).exists()
        #     #Case 1:  match to an open game
        #     if (open_games == True):
        #         Match.objects.filter(Q(open_lobby=True)).first().id2.display_name = username
        #         status = 'start'

        #     #Case 2: create a new open game 
        #     else:
        #         Match.objects.create(
        #             tournament_id=-1,
        #             open_lobby=True,
        #             id1=username
        #         )
        #         status = 'waiting'


        #     async_to_sync(self.channel_layer.group_send)(
        #         self.room_group_name,
        #         {
        #             'type': 'start_game',
        #             'status' : status
        #         }
        #     )


        #Case 2: hes in a game already - so record movement
        # is_playing = Match.objects.filter((Q(id1__id=username) | Q(id2__id=username)) & Q(ongoing=True)).exists()
        # if (is_playing == True):
            
        # broadcast a mesg to those in this group
        # async_to_sync(self.channel_layer.group_send)(
        #     self.room_group_name,
        #     {
        #         'type' : 'send_pos_data',
        #         'new_pos' : message
        #     }
        # )
        # self.send(text_data=json.dumps({
        #     'type' : 'chat',
        #     'message' : message
        # }))