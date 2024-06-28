from django.contrib import admin

from effugium.models import RawLevelData, RiseData, PlayerData, Config, Config4D

@admin.register(RawLevelData)
class RawLevelDataAdmin(admin.ModelAdmin):
    list_display = ('pk', 'userId', 'timeCreated', 'lastModified')

@admin.register(RiseData)
class RiseDataAdmin(admin.ModelAdmin):
    class Meta:
        name = "RiseData"
        verbose_name = "Rise Data"
        verbose_name_plural = "Rise Data"

    list_display = ('pk', 'userId', 'timeCreated', 'lastModified', 'registeredComplete')

@admin.register(PlayerData)
class PlayerDataAdmin(admin.ModelAdmin):
    class Meta:
        name = "PlayerData"
        verbose_name = "Player Data"
        verbose_name_plural = "Player Data"

    list_display = ('pk', 'UserId', 'timeCreated', 'lastModified', 'registeredComplete', 'isStaff')

@admin.register(Config)
class ConfigAdmin(admin.ModelAdmin):
     
    list_display = ('pk', 'layoutId')

@admin.register(Config4D)
class Config4DAdmin(admin.ModelAdmin):
     
    list_display = ('pk', 'layoutId')