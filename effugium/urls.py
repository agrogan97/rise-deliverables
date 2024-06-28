from django.contrib import admin
from django.urls import path, include

import effugium.views as _v

urlpatterns = [
    # path('begin/<str:userId>/', _v.effugiumView),
    # path("getData/", _v.getQueryDataView),
    
    # Production and staging endpoints
    path('rise/', _v.effugiumView),
    # Saving and loading data
    path('save/', _v.saveData),
    # path('saveY2/', _v.saveData2),
    # Rise endpoints
    path("validateParticipant/", _v.validateRiseParticipant),
    path("completed/", _v.confirmComplete),
    path('riseEP/', _v.testRiseEndpoint), # test on our end
    
    path("queryDB/", _v.queryDB),
    path("getUpdates/", _v.getRiseTracking),
    path("download/", _v.downloadData),

    # -- v2 endpoints -- #
    path('v2/begin/', _v.effugiumV2),
    path('rise/staging/', _v.effugiumV2),
    path('v2/getRoundById/<str:dim>/<str:id>/', _v.getRoundById),
    path('v2/validate/', _v.validateParticipantV2),
    path('v2/save/', _v.saveDataV2),
    path('v2/upload/', _v.loadLayoutFilesToDB),
    path('v2/empty/', _v.emptyConfigs),
    path('v2/registerComplete/', _v.registerCompleteV2),

    path('4d/begin/', _v.effugium4DView),
    path('4d/createPlayer/', _v.createPlayer),
    path('4d/empty/', _v.emptyConfigs4D),

    path('v2/testTracking/', _v.testTrackingEndpoint),

]