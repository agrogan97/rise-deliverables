from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from pointer.models import Graphs, PointerPlayer, GraphDesign
import json
import random, string
from pointer.serializers import GraphSerializer, GraphDesignSerializer, PointerPlayerSerializer
from pointer.forms import UploadJsonForm
from django.shortcuts import redirect
from django.http import HttpResponse
import os
import pickle
from rest_framework.renderers import JSONRenderer
from dotenv import load_dotenv
from datetime import datetime
load_dotenv()

def gameView(request):
    # Main game view

    template = "pointer.html"
    if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
        with open('/etc/config.json') as config_file:
            config = json.load(config_file)
        context = {"IP_BASE" : config["IP_BASE"]}
    else:
        context = {"IP_BASE" : os.getenv("IP_BASE")}

    return render(request, template, context)

def gameEndView(request):
    # Main game view

    template = "pointer_end.html"
    if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
        with open('/etc/config.json') as config_file:
            config = json.load(config_file)
        context = {"IP_BASE" : config["IP_BASE"]}
    else:
        context = {"IP_BASE" : os.getenv("IP_BASE")}

    return render(request, template, context)

@api_view(['POST'])
def saveGraph(request):
    """
    Receive a config file from the game and save it in the DB
    """

    if request.method == "POST":
        res = request.data
        Graphs.objects.create(
            level = int(res["level"]),
            nodes = res["nodes"],
            scores = res["scores"]
            )
        return Response(status=200)
    else:
        return Response(status=405)

@api_view(['GET'])
def loadRound(request, layoutId):
    if request.method == "GET":
        layout = Graphs.objects.filter(givenName = layoutId)
        if layout.exists():
            layout[0].nodes = json.loads(layout[0].nodes)
            serializer = GraphSerializer(layout[0])
            return Response(serializer.data, status=200)
        else:
            return Response(f"Layout {layoutId} not found", status=404)
    else:
        return Response("Bad request type", status=405)

@api_view(['POST'])
def savePlayerData(request):
    if request.method == "POST":
        uid = request.data['id']
        # Save 
        try:
            player = PointerPlayer.objects.filter(UserId=uid)
        except:
            print("Error trying to find player")
        if not player.exists():
            return Response(f'Player with ID {uid} not found', status=404)
        else:
            pl = player[0]
            try:
                rawData = pl.RawData
                # Check if the most recent game attempt is empty
                if len(rawData[-1]) == 0:
                    rawData[-1] = [request.data["data"]]
                else:
                    # if not then append new data to that array
                    rawData[-1].append(request.data["data"])
                pl.RawData = rawData
            except Exception as error:
                print("[DJANGO] Error in handling the raw data: ", error)
                return Response("Data handling error", status=500)

            # We can often just set the metadata at the start and not again, but we'll leave the option open
            # pl.Metadata['id'] = request.data.get("id")
            # pl.Metadata['iv'] = request.data.get("iv")
            # pl.Metadata['tag'] = request.data.get("tag")
            # pl.Metadata['debug'] = request.data.get("DEBUG")
            pl.Metadata['curriculumType'] = request.data.get("curriculumType")
            pl.source = request.data['source']
            try:
                pl.save()
            except:
                print("Error saving player data to DB")
                return Response("Error saving player data to DB", status=500)
            return Response("OK", status=200)
    else:
        return Response(status=405)
        

@api_view(['GET', 'POST'])
def createNewPlayer(request):
    # Create a UID for a new player by defining a Player object with only pk and UID, and send the UID back to the client
    # This can be used in the tutorial page, and the UID passed via URL params so it's created before gameplay has started
    if request.method == "POST":
        # Expect to get information on RISE or Prolific or Test here
        player_source = request.data['source'].replace("/", "")

        # Check if player already exists:
        try:
            uid = request.data["id"]
            hasUid = True
        except:
            hasUid = False

        if hasUid:
            player = PointerPlayer.objects.filter(UserId = uid)
            if player.exists():
                player = player[0]
                # Make their RawData entry an array of attempts
                player.RawData.append([])
                player.save()
                # --- and return the previous game parameters here
                # return Response(json.dumps(player.platformData))
                return Response(uid, status=200)

        # Only if demographics are needed
        if player_source == 'prolific_demo':
            player_info = {
                "age" : request.data['age'],
                "gender" : request.data['gender'],
                "prolificId" : request.data['prolificId'].replace("/", "")
            }
            uid = ''.join(random.choices(string.ascii_letters + string.digits, k=128))
            PointerPlayer.objects.create(UserId = uid, IP = "", Source = player_source, platformData=player_info, RawData = [[]])
        else:
            uid = request.data["id"]
            PointerPlayer.objects.create(UserId = uid, Source = player_source, RawData = [[]])
        return Response(uid, status=200)
        
    else:
        return Response(status=405)
    
@api_view(['GET', 'POST'])
def getGameSettings(request, uid):
    # GET checks for previous game settings and returns them if found, or None
    if request.method == "GET":
        try:
            player = PointerPlayer.objects.get(UserId = uid)
        except:
            return Response(f"Player {uid} not found", status=404)
        metadata = player.Metadata
        if "gameSettings" in player.Metadata:
            if player.Metadata["gameSettings"] == None:
                return Response({"success" : False}, status=200)
            else:
                return Response({"success" : True, "gameSettings" : player.Metadata["gameSettings"]})
        else:
            return Response({"success" : False}, status=200)

    # POST accepts new game settings and saves them
    elif request.method == "POST":
        try:
            player = PointerPlayer.objects.get(UserId = uid)
        except:
            return Response(f"Player {uid} not found", status=404)
        player.Metadata["gameSettings"] = request.data["gameSettings"]
        player.save()
        return Response("Done", status=200)
    else:
        return Response(status=405)

def landingView(request):
    if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
        with open('/etc/config.json') as config_file:
            config = json.load(config_file)    
        context = {"IP_BASE" : config["IP_BASE"]}
    else:
        context = {"IP_BASE" : os.getenv("IP_BASE")}

    template = "pt_landing.html"

    return render(request, template, context)

def tutorialView(request):
    if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
        with open('/etc/config.json') as config_file:
            config = json.load(config_file)    
        context = {"IP_BASE" : config["IP_BASE"]}
    else:
        context = {"IP_BASE" : os.getenv("IP_BASE")}
    template = "pt_tutorial.html"

    return render(request, template, context)

def graphDesignView(request):
    if request.user.is_authenticated:
        if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
            with open('/etc/config.json') as config_file:
                config = json.load(config_file)    
            context = {"IP_BASE" : config["IP_BASE"]}
        else:
            context = {"IP_BASE" : os.getenv("IP_BASE")}
        template = "pointer_design.html"

        return render(request, template, context)
    else:
        response = HttpResponse("Please login to view this content.")
    

@api_view(['GET'])
def uploadJson(request, t):
    # if t in ["1", "2", "3", "4", "5"] else 9,
    # Just a simple handler for uploading local jsons with the newest version
    if request.user.is_authenticated and request.method == "GET":
            print("[DEBUG]: Uploading...")
            for fname in os.listdir("/home/alex/pointerJsons/layouts"):
                print(f"[DEBUG]: Opening file {fname}")
                if fname.endswith(".json"):
                    f = open(f"/home/alex/pointerJsons/layouts/{fname}")
                    print(f"[DEBUG]: Opened file {fname}")
                    data = json.load(f)
                    for entry in data:
                        Graphs.objects.create(
                            givenName = entry['id'],
                            curriculumLevel = entry['concept_level'],
                            difficultyLevel = entry['strategy_level'],
                            nodes = json.dumps(entry['nodes']),
                            scores = json.dumps(entry['scores'])
                        )

    return Response("OK", 200)

@api_view(['GET'])
def deleteAll(request):
    if request.user.is_authenticated and request.method == "GET":
        Graphs.objects.all().delete()
        return Response("OK", status=200)
    
@api_view(['GET'])
def retrieveData(request):
    # Retrieve data as JSON
    if request.method == "GET" and request.user.is_authenticated:
        players = PointerPlayer.objects.filter(Source = "prolific")
        serializer = PointerPlayerSerializer(players, many=True)
        qsJson = JSONRenderer().render(serializer.data)
        try:
            with open(f'tmp/pointer_{int(datetime.now().timestamp())}.pickle', 'wb') as handle:
                pickle.dump(qsJson, handle)
                print("[DJANGO] Data saved successfully")
                return Response("OK", status=200)
        except Exception as error:
            print("[DJANGO]:", error)
            return Response(error, status=500)
    else:
        return Response("Method not allowed", status=405)
    
@api_view(['POST'])
def getDebriefAnswers(request, id):
    if request.method == "POST":
        player = PointerPlayer.objects.filter(UserId = id)
        if not player.exists():
            return Response(status=404)
        else:
            player = player.last()
            player.platformData = request.data["responses"]
            player.save()
            print(player.platformData)
            return Response(status=200)
    else:
        return Response(status=405)
    
@api_view(['GET'])
def getPterLevel(request):
    if request.method == "GET":
        vals = ["A", "B", "C", "D", "A_B", "A_C", "A_D", "B_B", "B_C", "B_D", "C_C", "C_D", "A_A_A", "A_A_B", "A_B_B", "A_A_C", "A_A_D", "B_C_D", "B_C_C", "B_D_D", "C_D_D", "C_C_D", "D_D_D"]
        lvl = {
            "id" : 1,
            "start" : random.choice(list(range(-10, 10))),
            "target" : random.choice(list(range(-10, 10))),
            "functions" : random.choice(vals)
        }

        return Response(lvl, status=200)
    else:
        return Response(status=405)