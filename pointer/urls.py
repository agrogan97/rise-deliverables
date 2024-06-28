from django.contrib import admin
from django.urls import path, include

import pointer.views as _p

urlpatterns = [
    path('landing/', _p.landingView),
    path('tutorial/', _p.tutorialView), 
    path('game/', _p.gameView),
    path('load/<str:layoutId>/', _p.loadRound),
    path('saveRound/', _p.savePlayerData),
    path('newPlayer/', _p.createNewPlayer),
    path('end/', _p.gameEndView),
    path('retrieve/', _p.retrieveData), 
    path('settings/<str:uid>/', _p.getGameSettings),
    path('debrief/<str:id>/', _p.getDebriefAnswers),

    path('delete/', _p.deleteAll),
    path('upload/<str:t>/', _p.uploadJson),

    path('pter/getLevel/', _p.getPterLevel)
]