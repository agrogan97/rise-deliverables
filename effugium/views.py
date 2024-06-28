import json
import re
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.core import serializers
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
import random
import platform
import os
import pandas as pd
import time
import requests
import urllib.parse
import csv
from io import StringIO
import pickle
import ast
import traceback
from datetime import datetime, timezone

from .models import RawLevelData,  RiseData, PlayerData, Config, Config4D
from .serializers import RawLevelDataSerializer, PlayerDataSerializer, ConfigSerializer

def effugiumView(request):
    """
    Summary:
        - Renders the effugium game page. Player validation is initiated client-side.
    Returns:
        - Django render method
    """

    if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
        with open('/etc/config.json') as config_file:
            config = json.load(config_file)    
        context = {"IP_BASE" : config["IP_BASE"]}
    else:
        context = {"IP_BASE" : os.getenv("IP_BASE")}

    # Implement a cutoff for swapping to the new system:
    # cuttoffTime = datetime(2023, 11, 25, 12, 0, 0, 0, pytz.UTC)
    # If player created account before this time, then use old system, else not
    uid = request.GET.get("id")
    if RawLevelData.objects.filter(userId = uid).exists():
        # timeCreated = RawLevelData.objects.get(userId = uid)["timeCreated"]
        return render(request, 'effugium.html', context)
    else:
        return render(request, 'effugium_v2.html', context)

    # return render(request, 'effugium.html', context)
    
    
def effugiumStagingView(request):
    """
    Redirects to the staging mode
    """
    if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
        with open('/etc/config.json') as config_file:
            config = json.load(config_file)    
        context = {"IP_BASE" : config["IP_BASE"]}
    else:
        context = {"IP_BASE" : os.getenv("IP_BASE")}

    return render(request, 'effugium_staging.html', context)

def effugium4DView(request):
    """
    Redirects to the staging mode
    """
    if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
        with open('/etc/config.json') as config_file:
            config = json.load(config_file)    
        context = {"IP_BASE" : config["IP_BASE"]}
    else:
        context = {"IP_BASE" : os.getenv("IP_BASE")}

    return render(request, 'effugium_4D.html', context)

@api_view(['GET', 'POST'])
def validateRiseParticipant(request):
    """
    Summary:
        - Forwards the `id`, `tag`, `iv`, and `email` (keywords) to a RISE endpoint that validates the participant
    Returns:
        - If valid, returns JsonResponse with the same information sent, confirming a valid participant.
        - Failed requests contain the relevant HTTP error code.

    NB: The URI is not decoded in this process, so remains in the correct form for making the validation GET request to RISE
    """
    if request.method == "GET" or request.method == "POST":
        # data = {
        #     "id" : request.query_params.get("id"),
        #     "tag" : request.query_params.get("tag"),
        #     "iv" : request.query_params.get("iv"),
        #     "email" : request.query_params.get("email"),
        #     "debug" : request.query_params.get("debug")
        # }

        data = {
            "id" : request.data.get("id"),
            "tag" : request.data.get("tag"),
            "iv" : request.data.get("iv"),
            "email" : request.data.get("email"),
        }

        # Send data to rise:
        x = requests.get("https://apply.risefortheworld.org/verify_roomworld", params=data, auth = ('', ''))
        print("Got code:", x.status_code)
        if x.status_code == 422 or x.status_code == "422":
            # Well actually we dont want a 422 - So filter this out another way
            print("Error 422 -  Attempt invalid")
            return HttpResponse(x.reason, status=x.status_code)
        elif x.status_code == 401 or x.status_code == 403:
            print("Error accessing RISE server")
            return HttpResponse(status=x.status_code)
        elif str(x.status_code) == "200":
            # We can just do the email comparison here in the view
            riseData = x.json()
            if riseData["email"] == data["email"].replace("%40", "@"):
                print("success")
                return Response(x.json())
            else:
                return HttpResponse(status=401)
        else:
            return HttpResponse(status=x.status_code)

@api_view(['POST'])
def saveData(request):
    """
    ---!! Used for Year 1 study, deprecated for Year 2 !!---
    -- ^^ Which was the plan until they launched pre-emptively --

    Summary:
            - Receive saved data from the game
    """

    if request.method == "POST":  
        # Reframe this to actually capture what ID might be
        # If we get an empty ID, assign a prolific ID - rise will always come with one
        if request.data.get("userId") == '':
            userId = "000" + str(random.randint(0, 99999999999))
        else:
            userId = request.data.get("userId")
        playerObj, created = RawLevelData.objects.get_or_create(userId = userId)
        urlP = json.loads(request.data.get('urlParameters'))
        # Encode URL parameters and remove email address
        for entry in urlP:
            if urlP[entry] is None:
                pass
            else:
                urlP[entry] = urllib.parse.quote(urlP[entry])
        # Remove email field
        urlP.pop("email")
        # Save
        playerObj.urlParameters = urlP

        startTime = json.loads(request.data.get("edata"))["exp_starttime"]
        if playerObj.rawData is None:
            playerObj.rawData = json.dumps({})
            playerObj.save()
        
        rawDataArray = json.loads(playerObj.rawData)
        rawDataArray[str(startTime)] = {
            "sdata" : request.data.get("sdata"),
            "edata" : request.data.get("edata"),
            "parameters" : request.data.get("parameters")
        }

        playerObj.rawData = json.dumps(rawDataArray)
        playerObj.userIP = request.META.get("REMOTE_ADDR")
        playerObj.save()

    # --- And here we will send an update to the RISE endpoint --- #
    # tracking = sendTracking(userId)
    # print("Completed with status:", tracking["status"])
    # print(tracking)

    return Response(userId)

def formatRiseTrackingData(rawData):
    data = json.dumps(rawData).replace('true', 'True').replace('false', 'False').replace('null', 'None')
    data = ast.literal_eval(data)
    tix = list(data.keys())[-1]
    roundIndices =  data[tix]['sdata']['trial_game']
    # roundIndices contains repeat indices where a game was restarted, so fetch the index of the last unique round only
    ixs = []
    for ix, i in enumerate(roundIndices):
        if ix != len(roundIndices)-1:
            if i != roundIndices[ix+1]:
                ixs.append(ix)
        else:
            ixs.append(ix)
    # use these indices to get the last timestamp for each response dict corresponding to the round index
    timestamps = []
    for i in ixs:
        tmp = data[tix]['sdata']['resp'][str(i)]['timestamp']
        if len(tmp) == 0:
            # The length would be 0 if the player has refreshed the page, and so timestamps haven't been stored
            timestamps.append(0) 
        else:
            timestamps.append(tmp[-1])

    uniqueRoundIndices = list(dict.fromkeys(roundIndices))
    # if uniqueRoundIndices[-1] == len(timestamps):
    #     timestamps.pop()

    # The current round updating doesn't track properly when you do round restarts
    # The timestamping stores restarts temporarily but then replaces them (what happens with skip)
    # Does weird stuff with tests because Mira doesn't track them together (moron)
    # I don't even think it's saving test rounds
    # dear god can we please just use my version

    return {
        "currentRound" : len(data[tix]['sdata']['attempted_layouts']),
        "maxRound" : 92,
        "roundComplete" : uniqueRoundIndices,
        "timestamp" : timestamps,
    }

@api_view(['POST'])
def getRiseTracking(request):
    """
    Summary:
        - Get an update on the progress of a specific/a group of participant/s by providing their userIds
    Returns:
        - JSON of format:
            {
                "currentRound" : N,
                "maxRound" : 92,
                "roundComplete" : [0, 1, 2, 3, ...],
                "timestamp" : [a, b, c, d, ...]
            }

    NB: currently this includes rounds with multiple attempts, so would need to filter out - But it's a start
    """
    if request.method == "POST":
        userId = request.data.get("userId")
        player = RiseData.objects.filter(userId=userId)
        if not player.exists():
            return Response(data=f'Could not find participant with id=${userId}', status=404)
        player = player[0]
        startTime = list(player.rawData.keys())[0]
        data = {
            "currentRound" : player.rawData[startTime]['sdata']['trial_game'][-1],
            "maxRound" : 92,
            "roundComplete" : player.rawData[startTime]['sdata']['trial_solved'],
            "timestamp" : [player.rawData[startTime]['sdata']['resp'][str(i)]['timestamp'][-1] for i in range(0, len(player.rawData[startTime]['sdata']['resp']))],
        }

        return Response(data, status=200)
    else:
        return Response(status=405)
    
def sendTracking(userId):
    """
    Summary:
        - Send tracking data to RISE after each level complete. Called in save data function server-side.
    """
    player = RiseData.objects.filter(userId=userId)
    if not player.exists():
        data = {"data" : f'Could not find participant with id=${userId}', "status": 404}
    player = player[0]
    startTime = list(player.rawData.keys())[0]
    tracking = {
        "currentRound" : len(player.rawData[startTime]['sdata']['trial_game']),
        "maxRound" : 92,
        "roundComplete" : player.rawData[startTime]['sdata']['trial_solved'],
        "timestamp" : [player.rawData[startTime]['sdata']['resp'][str(i)]['timestamp'][-1] for i in range(0, len(player.rawData[startTime]['sdata']['resp']))],
    }

    data = {
        "data" : tracking,
        "status" : 200
    }

    ## Make POST request with this data:
    # x = requests.post("https://apply.risefortheworld.org/verify_roomworld?id=%s&tag=%s&iv=%s&email=%s" % (urllib.parse.quote(data["id"]), urllib.parse.quote(data["tag"]), urllib.parse.quote(data["iv"]), urllib.parse.quote(data["email"])), data=data, auth = ('', ''))
    # return HttpResponse(x.status_code)
    ## .....

    return data

@api_view(['POST'])
def confirmComplete(request):
    if request.method == "POST":
        data = {
            "startTime" : request.data.get("startTime"),
            "endTime" : request.data.get("endTime"),
            "hasCompleted" : request.data.get("hasCompleted")
        }

    # post complete to RISE
    rawRiseData = request.data.get("riseData")
    rawRiseDataJson = json.loads(rawRiseData)
    data = {
            "id" : rawRiseDataJson["id"],
            "tag" : rawRiseDataJson["tag"],
            "iv" : rawRiseDataJson["iv"],
            "email" : rawRiseDataJson["email"]
        }

    x = requests.post("https://apply.risefortheworld.org/verify_roomworld?id=%s&tag=%s&iv=%s&email=%s" % (urllib.parse.quote(data["id"]), urllib.parse.quote(data["tag"]), urllib.parse.quote(data["iv"]), urllib.parse.quote(data["email"])), data=data, auth = ('', ''))
    if x.status_code == 422 or x.status_code == "422":
        print("Attempt invalid")
        return HttpResponse(status=x.status_code)
    elif x.status_code == 401 or x.status_code == 403:
        print("Error accessing RISE server")
        return HttpResponse(status=x.status_code)
    else:
        # Log that participant has completed and we've told RISE
        participant = RiseData.objects.get(userId=data["id"])
        participant.registeredComplete = True
        participant.save()
        return HttpResponse(status=200)


@api_view(['GET'])
def testRiseEndpoint(request):
    if request.method == "GET":
        data = {
            "id" : request.data.get("id"),
            "tag" : request.data.get("tag"),
            "iv" : request.data.get("iv")
        }
        
    return Response({
        "error": False,
        "user_id" : "85",
        "email":"someEmail@email.com",
        "env" : "staging"
    })

@api_view(['POST'])
def queryDB(request):
    # curl --user <user>:<password> -X POST http://127.0.0.1:8000/effugium/queryDB/
    if not request.user.is_authenticated:
        return Response(status=403)

    if request.method == "POST":
        data = {
            "population" : request.data.get("population"),
            "timescale" : request.data.get("timescale"),
            "datatype" : request.data.get("datatype"),
            "isComplete" : request.data.get("isComplete")
        }
        # Filter by population type
        if data["population"] == "rise":
            qs = RawLevelData.objects.filter(~Q(userId__startswith="000") & ~Q(userId__istartswith="RISE") & Q(userId__iregex=r'^.{7,}$') & ~Q(userIP="xx.xx.xx.xx") & ~Q(userIP="xx.xx.xx.xx"))
        elif data["population"] == "prolific":
            qs = RawLevelData.objects.filter(Q(userId__startswith="000") | Q(userId__istartswith="RISE"))
        else:
            qs = RawLevelData.objects.all()

        isComplete = True if data["isComplete"] == "complete" else False
        if data["datatype"] == "round":
            dbData, numComplete = formatByRound(qs, isComplete)
        elif data["datatype"] == "response":
            dbData = formatByResponse(qs, isComplete)

        # Pickle locally
        if platform.uname().system == "Windows":
            path = ("tmp/%s_%s.csv" % (str(int(time.time())), data["datatype"] ))
            df = pd.DataFrame.from_dict(dbData, orient="index")
            df.to_csv(path)
            userMsg = "Your data is available at " + path
        elif platform.uname().system == "Linux":
            try:
                print("Saving file")
                path = ("%s_%s.csv" % (str(int(time.time())), data["datatype"] ))
                df = pd.DataFrame.from_dict(dbData, orient="index")
                df.to_csv(path)
            except Exception as e:
                print(traceback.format_exc())
            userMsg = "Your data is available at " + path
        print("Made it to this point")

        if request.user.is_authenticated:
            # return HttpResponse(json.dumps(roundData), content_type='text/csv')
            return HttpResponse(userMsg)
        else:
            return Response(status=403)
    else:
        return Response("Query type not accepted", status=403)

def getQueryDataView(request):

    # Query for all RISE data, pass it through the formatByRound() function, and output some stats
    qs = RawLevelData.objects.filter(~Q(userId__startswith="000") & ~Q(userId__istartswith="RISE") & Q(userId__iregex=r'^.{7,}$') & ~Q(userIP="xx.xx.xx.xx") & ~Q(userIP="xx.xx.xx.xx"))
    # Save raw queryset
    serializer = RawLevelDataSerializer(qs, many=True)
    qsJson = JSONRenderer().render(serializer.data)

    with open(f'tmp/{int(datetime.now().timestamp())}.pickle', 'wb') as handle:
        pickle.dump(qsJson, handle)
    # roundData, numComplete = formatByRound(qs, speed=True)

    context = {
        "numPlayers" : len(qs),
        "numComplete" : 0,
        "pctComplete" : 0 if len(qs)==0 else round((0/len(qs))*100, 2)
    }

    return render(request, 'effugiumData.html', context)

@api_view(['GET'])
def downloadData(request):
    import datetime
    qs = RawLevelData.objects.filter(~Q(userId__startswith="000") & ~Q(userId__istartswith="RISE") & Q(userId__iregex=r'^.{7,}$') & ~Q(userIP="xx.xx.xx.xx") & ~Q(userIP="xx.xx.xx.xx"))
    try:
        yr = int(request.GET.get("year"))
    except:
        yr = None
    if yr is not None:
        qs = qs.filter(timeCreated__gte=datetime.date(yr, 8, 10)) # year, month, date
    serializer = RawLevelDataSerializer(qs, many=True)
    qsJson = JSONRenderer().render(serializer.data)
    with open(f'tmp/{int(datetime.datetime.now().timestamp())}.pickle', 'wb') as handle:
        pickle.dump(qsJson, handle)

    from datetime import datetime, timezone

    return Response(status=200)


def formatByRound(qs, completedOnly=False, speed=False):
    """
    Summary:
            - Take in queryset and return in round-by-round format
    
    dict_keys(['expt_index', 'expt_trial', 'trial_layout', 'trial_level', 'trial_solved', 'trial_attempts', 'trial_game', 
                'trial_transfer', 'trial_test', 'game', 'game_solved', 'game_layout', 'game_level', 'game_attempts', 
                'game_transfer', 'game_test', 'test_index', 'test_solved', 'test_layout', 'RPM', 'attempted_layouts', 'resp'])
    """
    count = 0
    data = {}
    numComplete = 0
    for game in qs:
        playerTrials = json.loads(game.rawData)
        playerId = game.userId
        # Within playerTrials we have all this individual players' attempts.
        # We just want the first one where edata.gameCompleted is true

        # Get all the timestamp keys:
        timestamps = list(playerTrials.keys())
        gotCompletedGame = False
        for t in timestamps:
            hasCompleted = json.loads(playerTrials[t]['edata'])['gameCompleted']
            # If completed, this is the data we store:
            if hasCompleted:
                gotCompletedGame = True
                numComplete += 1
                try:
                    sdata = json.loads(playerTrials[t]['sdata'])
                except:
                    sdata = {}
                for i in range(len(sdata["expt_index"])):
                    if len(sdata["resp"][str(i)]["xloc"]) == 0 or len(sdata["resp"][str(i)]["yloc"]) == 0:
                        lastRoom = []
                    else:
                        lastRoom = [int(sdata["resp"][str(i)]["xloc"][-1])%4, int(sdata["resp"][str(i)]["yloc"][-1])%4]
                        # lastRoom = [(sdata["resp"][str(i)]["xloc"][-1]-1)%3, (sdata["resp"][str(i)]["yloc"][-1]-1)%3]
                    try:
                        data[str(count)] = {
                            "id" : playerId,
                            "iv" : None if game.urlParameters is None else game.urlParameters["iv"],
                            "tag" : None if game.urlParameters is None else game.urlParameters["tag"],
                            "pk" : game.pk,
                            "expt_index" : sdata["expt_index"][i],
                            "expt_trial" : sdata["expt_trial"][i],
                            "trial_layout" : sdata["trial_layout"][i],
                            "trial_level" : sdata["trial_level"][i],
                            "trial_solved" : sdata["trial_solved"][i],
                            "trial_attempts" : sdata["trial_attempts"][i],
                            "trial_game" : sdata["trial_game"][i],
                            "trial_transfer" : sdata["trial_transfer"][i],
                            "trial_test" : sdata["trial_test"][i],
                            "round_start_time" : sdata["resp"][str(i)]["timestamp"][0] - sdata["resp"][str(i)]["reactiontime"][0],
                            "round_end_time" : sdata["resp"][str(i)]["timestamp"][-1],
                            "last_room" : lastRoom,
                            "complete" : gotCompletedGame,
                            # "last_room" : [(sdata["resp"][str(i)]["xloc"][-1]-1)%3, (sdata["resp"][str(i)]["yloc"][-1]-1)%3] if (len(sdata["resp"][str(i)]["xloc"]) !=0 and len(sdata["resp"][str(i)]["yloc"]) != 0) else [],
                        }
                    except Exception as e:
                        print(playerId, sdata["resp"][str(i)])
                        print(traceback.format_exc())
                    count += 1
                # Break out since we only want the first completed instance
                break
            
        if not gotCompletedGame and not completedOnly:
            # Have never received a completed game
            t = timestamps[0]
            sdata = json.loads(playerTrials[t]['sdata'])
            for i in range(len(sdata["expt_index"])):
                if len(sdata["resp"][str(i)]["xloc"]) == 0 or len(sdata["resp"][str(i)]["yloc"]) == 0:
                    lastRoom = [-1, -1]
                else:
                    lastRoom = [int(sdata["resp"][str(i)]["xloc"][-1])%4, int(sdata["resp"][str(i)]["yloc"][-1])%4]
                    # lastRoom = [(sdata["resp"][str(i)]["xloc"][-1]-1)%3, (sdata["resp"][str(i)]["yloc"][-1]-1)%3]
                try:
                    data[str(count)] = {
                        "id" : playerId,
                        "iv" : None if game.urlParameters is None else game.urlParameters["iv"],
                        "tag" : None if game.urlParameters is None else game.urlParameters["tag"],
                        "pk" : game.pk,
                        "expt_index" : sdata["expt_index"][i],
                        "expt_trial" : sdata["expt_trial"][i],
                        "trial_layout" : sdata["trial_layout"][i],
                        "trial_level" : sdata["trial_level"][i],
                        "trial_solved" : sdata["trial_solved"][i],
                        "trial_attempts" : sdata["trial_attempts"][i],
                        "trial_game" : sdata["trial_game"][i],
                        "trial_transfer" : sdata["trial_transfer"][i],
                        "trial_test" : sdata["trial_test"][i],
                        "round_start_time" : sdata["resp"][str(i)]["timestamp"][0] - sdata["resp"][str(i)]["reactiontime"][0],
                        "round_end_time" : sdata["resp"][str(i)]["timestamp"][-1],
                        "last_room" : lastRoom,
                        "complete" : gotCompletedGame,
                        # "last_room" : [(sdata["resp"][str(i)]["xloc"][-1]-1)%3, (sdata["resp"][str(i)]["yloc"][-1]-1)%3] if (len(sdata["resp"][str(i)]["xloc"]) !=0 and len(sdata["resp"][str(i)]["yloc"]) != 0) else [],
                    }
                except Exception as e:
                        print(playerId, sdata["resp"][str(i)]["timestamp"], sdata["resp"][str(i)]["reactiontime"])
                        print(traceback.format_exc())
                count += 1
    print("Done!")
    return data, numComplete

def formatByResponse(qs, completedOnly=False):
    """
    Summary:
            - Take in queryset and return in response-by-response format
    """    
    
    count = 0
    data = {}
    for game in qs:
        playerTrials = json.loads(game.rawData)
        playerId = game.userId
        # Within playerTrials we have all this individual players' attempts.
        # We just want the first one where edata.gameCompleted is true

        # Get all the timestamp keys:
        timestamps = list(playerTrials.keys())
        gotCompletedGame = False
        for t in timestamps:
            hasCompleted = json.loads(playerTrials[t]['edata'])['gameCompleted']
            # If completed, this is the data we store:
            if hasCompleted:
                gotCompletedGame = True
                sdata = json.loads(playerTrials[t]['sdata'])
                responses = sdata['resp']
                for r in responses:
                    for i in range(len(responses[r]['timestamp'])):
                        data[str(count)] = {
                            "id" : playerId,
                            "pk" : game.pk,
                            "timestamp" : responses[r]['timestamp'][i],
                            "reactiontime" : responses[r]['reactiontime'][i],
                            "direction" : responses[r]['direction'][i],
                            "allowed" : responses[r]['allowed'][i],
                            "tool" : responses[r]['tool'][i],
                            "xloc" : responses[r]['xloc'][i],
                            "yloc" : responses[r]['yloc'][i]
                        }
                        count += 1
                # Break out since we only want the first completed instance
                break

        if not gotCompletedGame and not completedOnly:
            t = timestamps[0]
            sdata = json.loads(playerTrials[t]['sdata'])
            responses = sdata['resp']
            for r in responses:
                for i in range(len(responses[r]['timestamp'])):
                    data[str(count)] = {
                        "id" : playerId,
                        "pk" : game.pk,
                        "timestamp"     :    responses[r]['timestamp'][i],
                        "reactiontime"  :    responses[r]['reactiontime'][i],
                        "direction"     :    responses[r]['direction'][i],
                        "allowed"       :    responses[r]['allowed'][i],
                        "tool"          :    responses[r]['tool'][i],
                        "xloc"          :    responses[r]['xloc'][i],
                        "yloc"          :    responses[r]['yloc'][i]
                    }
                    count += 1

    return data

# --- Roomworld V2 --- #

def effugiumV2(request):
    """
    Redirects to roomworld V2
    """
    if os.getenv("IP_BASE") == "None" or os.getenv("IP_BASE") == None:
        with open('/etc/config.json') as config_file:
            config = json.load(config_file)    
        context = {"IP_BASE" : config["IP_BASE"]}
    else:
        context = {"IP_BASE" : os.getenv("IP_BASE")}

    return render(request, 'effugium_v2.html', context)

@api_view(['POST'])
def validateParticipantV2(request):
    if request.method == "POST":
        data = {
            "id" : request.data.get("id"),
            "tag" : request.data.get("tag"),
            "iv" : request.data.get("iv"),
            "email" : request.data.get("email"),
            "debug" : request.data.get("debug"),
            "env" : request.data.get("env"),
        }

        gameParameters = request.data.get("gameParameters")

        # Query RISE server to validate URL parameters
        res = requests.get("https://apply.risefortheworld.org/verify_roomworld", params=data, auth = ('', ''))
        if (data["id"] == 'test') or (int(res.status_code) == 200) or (data["debug"]):
            try:
                player = PlayerData.objects.get(UserId = data["id"])
                # if this player already exists, then send a message to the server with the player data
                serializer = PlayerDataSerializer(player)
                return Response(serializer.data, status=200)
            except:
                PlayerData.objects.create(UserId = data["id"], iv = data["iv"], tag = data["tag"], cohortYear = "2023/2024", isStaff = (data["id"] == "test"), environment=data["env"], gameParameters = gameParameters)
                return Response("New User", 200)
        else:
            return Response(res.reason, status=404)
    else:
        return Response("Request type not allowed", status=405)

@api_view(['POST'])
def saveDataV2(request):
    if request.method == "POST":
        # NB that this consists of both player data and RISE tracking data
        # The player data is saved to DB, while the RISE data will be forwarded to their endpoint
        data = request.data.get("data")
        rise = request.data.get("riseTracking")
        uid = request.data.get("id")
        try:
            player = PlayerData.objects.get(UserId=request.data.get("id"))
            player.data = data
            player.riseTracking = rise
            player.environment = request.data.get("env")
            player.save()
        except Exception as e:
            print(e)
            return Response(f'User with ID {uid} not found', status=404)
        
        sendParams = {
            "id" : uid,
            "iv" : request.data.get("iv"),
            "tag" : request.data.get("tag"),
            "email" : request.data.get("email"),
            "roundNum" : rise["roundNum"],
            "maxRounds" : rise["maxRounds"],
            "roundComplete" : json.dumps(rise["roundComplete"]),
            "environment" : request.data.get("env")
        }

        # Forward data to RISE endpoint
        if sendParams["environment"] == "prod" or sendParams["environment"] == "production":
            res = requests.get("https://apply.risefortheworld.org/verify_roomworld", params=sendParams, auth = ('', ''))
        elif sendParams["environment"] == "staging":
            res = requests.get("https://apply-staging.risefortheworld.org/verify_roomworld", params=sendParams, auth = ('', ''))
        # res = requests.get("http://127.0.0.1:8000/effugium/v2/testTracking/", params=sendParams)
        if int(res.status_code == 200):
            print(f"[DEBUG]: RISE tracking saved. {res.status_code}")
        else:
            print(f"[DEBUG]: Error saving rise data: {res.status_code} {res.reason}")

        return Response("OK", status=200)
    else:
        return Response("Request type not allowed", status=405)
    
@api_view(['GET'])
def testTrackingEndpoint(request):
    if request.method == "GET":
        data = request.GET.get("environment")
        print("roundComplete:", data)
        return Response(200)
    
@api_view(['POST'])
def createPlayer(request):
    # For creating a player directly from a link, intended for use when launching Oxford studies. This will be turned off when not in use.
    if request.method == "POST":
        uid = request.data.get("id")
        source = request.data.get("source")
        gameParameters = request.data.get("gameParameters")
        try:
            PlayerData.objects.create(UserId = uid, playMode="4D", cohortYear=source, gameParameters=gameParameters)
        except Exception as e:
            print(e)
            return Response(f'Unable to create user {uid}: Error {e}', status=500)
        return Response("OK", status=200)
    else:
        return Response("Request type not allowed", status=405)

@api_view(['GET'])
def getRoundById(request, dim, id):

    # TODO implement round objects in models.py
    
    if request.method == "GET":
        if dim == "4D":
            round = Config4D.objects.filter(layoutId=id)
        else:
            round = Config.objects.filter(layoutId=id)
        if round.exists():
            serializer = ConfigSerializer(round[0])
            return Response(serializer.data, status=200)
        else:
            return Response(f'Unable to find round with ID: {id} type ${dim}', status=404)
            
    else:
        return Response(f"Request type {request.method} not allowed.", status=405)

@api_view(['GET'])
def loadLayoutFilesToDB(request):
    if request.user.is_authenticated:
        # read file in
        basepath = "C:/Users/agrog/Documents/Oxford/gamesuiteBackend/effugium/static/effugium/production/layout/"
        for fname in os.listdir(basepath): 
        # for i in range(1, 25):
            # fname = f'r1_3_{i}.txt'
            if fname.endswith(".txt"):
                layout = open(basepath + fname).read()
                Config.objects.update_or_create(layoutId = fname[:-4], layout=layout)
                # print(f'Saved layout {fname}')

        return Response("OK", status=200)
    else:
        return Response(status=403)

@api_view(['GET'])
def emptyConfigs(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            layouts = Config.objects.all()
            for i in layouts:
                i.delete()

            return Response("OK", status=200)
    else:
        return Response(status=403)
    
@api_view(['GET'])
def emptyConfigs4D(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            layouts = Config4D.objects.all()
            for i in layouts:
                i.delete()

            return Response("OK", status=200)
    else:
        return Response(status=403)

@api_view(['POST'])
def registerCompleteV2(request):
    if request.method == "POST":
        data = {
            "id" : str(request.data.get("id")),
            "tag" : str(request.data.get("tag")),
            "iv" : str(request.data.get("iv")),
            "email" : str(request.data.get("email")),
        }

        res = requests.post("https://apply.risefortheworld.org/verify_roomworld?id=%s&tag=%s&iv=%s&email=%s" % (urllib.parse.quote(data["id"]), urllib.parse.quote(data["tag"]), urllib.parse.quote(data["iv"]), urllib.parse.quote(data["email"])), data=data, auth = ('', ''))

        if res.status_code == 200 or data["id"] == "debug":
            player = PlayerData.objects.get(UserId=data["id"])
            player.registeredComplete = True
            player.save()
            return Response("OK", status=200)
        else:
            return Response("Error", status=res.status_code)

# ------------------------------- #

# --- Unused Functions --- #

def monitorIp(IP):

    allowed = True

    if platform.system() == "Windows":
        ipListPath = "/"
    elif platform.system() == "Linux":
        ipListPath = "/"
    elif platform.system() == "Darwin":
        ipListPath = "tmp/"

    # Check if file exists:
    if not os.path.exists(ipListPath + "ipList.txt"):
        with open(ipListPath + "ipList.txt", 'x') as f:
            f.write("timestamp ip\n")
            f.close()
    # Create blacklist
    if not os.path.exists(ipListPath + "ipBlacklist.txt"):
        with open(ipListPath + "ipBlacklist.txt", 'x') as f:
            f.write("ip\n")
            f.close()
    # Open file as pd dataframe
    # ---
    ipData = pd.read_csv(ipListPath + "ipList.txt", sep=" ", header=0)
    blacklist = pd.read_csv(ipListPath + "ipBlacklist.txt", sep=" ", header=0)
    if IP in str(ipData["ip"]):
        # Compute request rate
        # v = ipData.ip.value_counts() # <-- Counts occurences of all unique IPs
        inst = ipData[ipData.ip.isin([IP])]
        n = int(inst.shape[0]/10) + 1 # make n proportional to the number of occurences
        checks = random.sample(inst.index.values.tolist(), n)
        checks.append(-1)
        for check in checks:
            start = inst.iloc[[0]]
            end = inst.loc[[check]] if check != -1 else inst.iloc[[check]]
            if check / (end.iloc[0]["timestamp"] - start.iloc[0]["timestamp"]) > 10000: # i.e n attempts per d seconds
                # blacklist IP
                if IP not in str(blacklist["ip"]):
                    blacklist.loc[blacklist.shape[0]] = [IP]

    if IP in str(blacklist["ip"]):
        allowed = False

    ipData.loc[ipData.shape[0]] = [time.time(), IP]
    # ---
    # save
    ipData.to_csv(ipListPath + "ipList.txt", header=["timestamp", "ip"], sep=" ", index=None)
    blacklist.to_csv(ipListPath + "ipBlacklist.txt", header=["ip"], sep=" ", index=None)

    return allowed

def removeBlacklistedIp(request, IP):

    IP = IP.replace("%", '.')

    if not request.user.is_authenticated:
        return HttpResponse(status=403)

    if platform.system() == "Windows":
        ipListPath = "tmp/"
    elif platform.system() == "Linux":
        ipListPath = "tmp/"

    if os.path.exists(ipListPath+"ipBlacklist.txt"):
        blacklist = pd.read_csv(ipListPath+"ipBlackList.txt", sep=" ", header=0)
        blacklist = blacklist.loc[blacklist['ip'] != IP]
        blacklist.to_csv(ipListPath + "ipBlacklist.txt", header=["ip"], sep=" ", index=None)

    return HttpResponse(status=200)

@api_view(['GET'])
def dumpData(request, type):
    # Allowed types are `all`, `rise`, and `prolific`

    if request.user.is_authenticated:

        if request.method == "GET":
            # Get all data from DB and package nicely as JSON
            if type == "all":
                qs = RawLevelData.objects.all()
                qs_json = serializers.serialize('json', qs)
                return HttpResponse(qs_json, content_type="application/json")
            elif type == "prolific":
                qs == RawLevelData.objects.filter(userId__startswith='000')
                qs_json = serializers.serialize('json', qs)
                return HttpResponse(qs_json, content_type="application/json")
            elif type == "rise":
                qs == RawLevelData.objects.filter(userId__endswith="=")
                qs_json = serializers.serialize('json', qs)
                return HttpResponse(qs_json, content_type="application/json")
            else:
                return Response("Query type not known", status=404)
    else:
        return Response(status=401)